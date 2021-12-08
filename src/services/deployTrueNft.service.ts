import path from 'path';
import fs from 'fs';
import { DeployService } from './deploy.service';
import { Account } from '@tonclient/appkit';
import { Collection } from '../models/collection';
import { globals } from '../config/globals';
import { everscale_settings } from '../config/everscale-settings';

export class DeployTrueNftService {
    private deployService : DeployService;

    constructor() {
        this.deployService = new DeployService();
    }
    
    async deployTrueNft(pathWithContracts : string, collection: Collection) : Promise<string> {
        
        let indexBasisContract = fs.readFileSync(path.resolve(pathWithContracts, "IndexBasis.sol")).toString();
        let dataContract = fs.readFileSync(path.resolve(pathWithContracts, "Data.sol")).toString();
        let indexContract = fs.readFileSync(path.resolve(pathWithContracts, "Index.sol")).toString();
        let rootNftContract = fs.readFileSync(path.resolve(pathWithContracts, "NftRoot.sol")).toString();
        
        let dataAccount = await this.deployService.createContractAccount(dataContract, pathWithContracts);
        let indexAccount = await this.deployService.createContractAccount(indexContract, pathWithContracts);
        let rootNftAccount = await this.deployService.createContractAccount(rootNftContract, pathWithContracts);
        let indexBasisAccount = await this.deployService.createContractAccount(indexBasisContract, pathWithContracts);
        let address = "0";
        try {
            address = await this.deployRootNft(rootNftAccount, indexAccount, dataAccount, collection);
            fs.renameSync(pathWithContracts, path.join(globals.TEMP_COLLECTION, address))
            console.log("RootNft address: " + await rootNftAccount.getAddress());
            await this.deployBasis(rootNftAccount, indexBasisAccount);
        } catch(err) {

            console.log(err);
        }

        return address;
    }
    
    private async deployRootNft(rootNftAccount: Account, indexAccount: Account, dataAccount: Account, collection: Collection) : Promise<string> {
        let initInput = await this.buildInitInput(indexAccount, dataAccount, collection)
        try {
            await this.deployService.deploy(
                rootNftAccount,
                initInput
            );
            return rootNftAccount.getAddress();
        } catch(err) {
            console.log(err);
            return "0";
        }
    }
    
    private async deployBasis(rootNftAccount: Account, indexBasisAccount: Account) : Promise<void> {
        let body = await this.getBody(rootNftAccount, indexBasisAccount);
        let walletAcc = await this.getWalletAcc(rootNftAccount);
        let rootNftAddress = await rootNftAccount.getAddress();
        let transaction = await this.getTransaction(walletAcc, rootNftAddress, body);
        const result = await this.getResult(rootNftAccount, rootNftAddress, transaction);
    }

    private async getBody(rootNftAccount: Account, indexBasisAccount: Account) : Promise<string> {
        let { body } = await rootNftAccount.client.abi.encode_message_body({
            abi: rootNftAccount.abi,
            signer: rootNftAccount.signer,
            is_internal: true,
            call_set: {
                function_name: "deployBasis",
                input: {
                    codeIndexBasis: (await this.deployService.getDecodeTVC(indexBasisAccount)).code
                }
            },
        });
        return body;
    }

    private async getTransaction(walletAcc: Account, rootNftAddress: string, body: string) : Promise<any> {
        let { transaction } = await walletAcc.run(
            "sendTransaction",
            {
                dest: rootNftAddress,
                value: 730_000_000,
                flags: 3,
                bounce: true,
                payload: body,
            }
        );
        return transaction;
    }

    private async getResult(rootNftAccount: Account, rootNftAddress: string, transaction: any) {
        let { result } = await rootNftAccount.client.net.wait_for_collection({
            collection: "transactions",
            filter: {
                account_addr: { eq: rootNftAddress },
                now: { ge: transaction.now },
                aborted: { eq: false },
            },
            result: "now aborted",
            timeout: 10000,
        });
        return result;
    }

    // This is a SafeMultisig Wallet contract for testing purposes.
    // In TON OS SE this contract is predeployed at 0:d5f5cfc4b52d2eb1bd9d3a8e51707872c7ce0c174facddd0e06ae5ffd17d2fcd 
    // address with one single custodian and its initial balance is about 1 million tokens.
    private async getWalletAcc(rootNftAccount: Account) : Promise<Account> {
        let walletAbi = await JSON.parse(fs.readFileSync(path.resolve(globals.SAMPLE_DATA_PATH, "safeMultisigWallet", "SafeMultisigWallet.abi.json")).toString());
        let walletTvc = fs.readFileSync(path.resolve(globals.SAMPLE_DATA_PATH, "safeMultisigWallet", "SafeMultisigWallet.tvc"), {encoding: 'base64'});
        const walletAcc = new Account(
            {
                abi: walletAbi, 
                tvc: walletTvc
            },
            {
                client: rootNftAccount.client,
                address: everscale_settings.SAFE_MULTISIG_ADDRESS,
                signer: {
                    type: "Keys",
                    keys: everscale_settings.SAFE_MULTISIG_KEYS
                }
            }
        );
        return walletAcc;
    }
    
    private async buildInitInput(indexAccount: Account, dataAccount: Account, collection: Collection) : Promise<object> {

        let _nftTypes : string[] = [];
        let _limit : number[] = [];
        for (let index = 0; index < collection.getRarities().length; index++) {
            let typeName = collection.getRarities()[index].getName()
            _nftTypes.push(Buffer.from(typeName).toString("hex"))
            _limit.push(collection.getRarities()[index].getLimit())
        }

        let _name = collection.getDescription().getName()
        let _icon = collection.getDescription().getIcon() ?? ""
        _name = Buffer.from(_name).toString("hex")
        _icon = Buffer.from(_icon).toString("hex")

        let initInput = {
            codeIndex: (await this.deployService.getDecodeTVC(indexAccount)).code,
            codeData: (await this.deployService.getDecodeTVC(dataAccount)).code,
            nftTypes: _nftTypes,
            limit: _limit,
            name: _name,
            icon: _icon
        }

        console.log(initInput)
        return initInput
    }
}