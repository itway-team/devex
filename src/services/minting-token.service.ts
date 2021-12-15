import path from 'path';
import fs from 'fs';
import { Account } from '@tonclient/appkit';
import { globals } from '../config/globals';
import { DeployService } from './deploy.service';
import { TonClient } from '@tonclient/core';
import { everscale_settings } from '../config/everscale-settings';
import { TokenImageCreator } from './gen-token-image.service';
import { addFileToIPFS } from './add-ipfs.service';
import { ipfs_setting } from '../config/ipfs-setting';

const convert = (from, to) => (str) => Buffer.from(str, from).toString(to);
const utf8ToHex = convert("utf8", "hex");

export class MintNftService {
    private deployService: DeployService;
    private client: TonClient;
    private collectionFolder: string = '';

    constructor(collectionRootAddress: string) {
        this.deployService = new DeployService();
        this.client = new TonClient({
            network: {
                endpoints: [everscale_settings.ENDPOINTS]
            }
        });
        // Collection folder is the root address withot the 0: in the front
        this.setCollectionSourceFolder(collectionRootAddress.substring(2));
    }

    private setCollectionSourceFolder(collectionFolder: string) {
        this.collectionFolder = path.resolve(globals.RESULT_COLLECTION, collectionFolder);
    }

    private getCollectionSourceFolder() {
        return this.collectionFolder;
    }

    async mintNft(dataForMinting) {
        const rootNftContract = fs.readFileSync(path.resolve(this.getCollectionSourceFolder(), "NftRoot.sol")).toString();
        const rootNftAccount = await this.deployService.createContractAccount(
            rootNftContract,
            this.collectionFolder,
            'NftRoot',
            { _name: utf8ToHex(dataForMinting.body.contractName) }
        );

        const mintParams = await this.getMintParams(dataForMinting);

        const mintMessage = await this.getMintMessage(
            rootNftAccount,
            'mintNft',
            mintParams
        );

        await this.sendMessageToMint(mintMessage.message);
    }

    async getMintParams(mintigData): Promise<object> {
        //Data which user inputted to the form
        const userParams = mintigData.body;
        // const userEnum = userParams.enum;
        const userMediaFile = mintigData.files;

        const resultParams = {
            name: utf8ToHex(userParams.contractName),
            url: utf8ToHex(""),
            editionNumber: 1,
            editionAmount: 1,
            managersList: [],
            royalty: 1,
            nftType: userParams.rarities ? utf8ToHex(userParams.rarities) : ""
        };

        // Data from the collectionInfo.json
        const collectionInfo = fs.readFileSync(
            path.resolve(this.collectionFolder, 'collectionInfo.json')
        ).toString();
        const collectionInfoJSON = JSON.parse(collectionInfo);
        const collectionParams = collectionInfoJSON.collection.parameters;
        const enumOfCollection = collectionInfoJSON.enums;
        const mediafilesOfCollection = collectionInfoJSON.mediafiles;

        for (const currentCollecitonParam of collectionParams) {
            // For uint and string params
            if (currentCollecitonParam.name in userParams) {
                if (currentCollecitonParam.type === 'uint') {
                    resultParams[currentCollecitonParam.name] = userParams[currentCollecitonParam.name];
                } else if (currentCollecitonParam.type === 'string') {
                    resultParams[currentCollecitonParam.name] = utf8ToHex(userParams[currentCollecitonParam.name]);
                }
            }
        }

        for (const currentEnum of enumOfCollection) {
            // If a enum there is no in the collectionInfo.json this loop will not work
            resultParams[currentEnum.name] = Number(userParams[currentEnum.name]);
        }

        for (const currentMediafile of mediafilesOfCollection) {
            // If a mediafile there is no in the collectionInfo.json this loop will not work 
            resultParams[currentMediafile.name] = utf8ToHex(await this.getIpfsURL(userMediaFile[currentMediafile.name]));
        }

        return resultParams;
    }

    private async getMintMessage(account: Account, func: string, input: object) {
        const messageParams = {
            abi: account.abi,
            address: await account.getAddress(),
            //
            // Hard code
            //
            src_address: everscale_settings.SAFE_MULTISIG_ADDRESS,

            call_set: {
                function_name: func,
                input
            },
            value: '2000000000'
        };

        return await this.client.abi.encode_internal_message(messageParams);
    }

    private async sendMessageToMint(message: string) {
        const shardIdParams = {
            message,
            send_events: false
        }

        await this.client.processing.send_message(shardIdParams);
    }

    private async getIpfsURL(file) : Promise<string>{
        let cid = await addFileToIPFS({path: "path", content: file.data}) 
        return `${ipfs_setting.GATEWAY}/ipfs/${cid}`
    }
}