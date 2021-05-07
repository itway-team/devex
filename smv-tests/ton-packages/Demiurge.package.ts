export default {"abi":{"ABI version":2,"header":["time"],"functions":[{"name":"constructor","inputs":[{"name":"store","type":"address"},{"name":"densRoot","type":"address"},{"name":"tokenRoot","type":"address"}],"outputs":[]},{"name":"onStateUpdate","inputs":[{"name":"state","type":"uint8"}],"outputs":[]},{"name":"deployPadawan","inputs":[{"name":"pubkey","type":"uint256"}],"outputs":[]},{"name":"onPadawanDeploy","inputs":[{"name":"key","type":"uint256"}],"outputs":[]},{"name":"deploySetCodeProposal","inputs":[{"name":"start","type":"uint32"},{"name":"end","type":"uint32"},{"name":"title","type":"bytes"},{"components":[{"name":"contractType","type":"uint8"},{"name":"code","type":"cell"}],"name":"specific","type":"tuple"}],"outputs":[]},{"name":"deployReserveProposal","inputs":[{"name":"start","type":"uint32"},{"name":"end","type":"uint32"},{"name":"title","type":"bytes"},{"components":[{"name":"name","type":"bytes"},{"name":"ts","type":"uint32"}],"name":"specific","type":"tuple"}],"outputs":[]},{"name":"deploySetOwnerProposal","inputs":[{"name":"start","type":"uint32"},{"name":"end","type":"uint32"},{"name":"title","type":"bytes"},{"components":[{"name":"name","type":"bytes"},{"name":"owner","type":"address"},{"name":"ts","type":"uint128"}],"name":"specific","type":"tuple"}],"outputs":[]},{"name":"deploySetRootOwnerProposal","inputs":[{"name":"start","type":"uint32"},{"name":"end","type":"uint32"},{"name":"title","type":"bytes"},{"components":[{"name":"pubkey","type":"uint256"},{"name":"comment","type":"bytes"}],"name":"specific","type":"tuple"}],"outputs":[]},{"name":"onProposalDeploy","inputs":[],"outputs":[]},{"name":"onProposalFinalized","inputs":[{"components":[{"name":"id","type":"uint32"},{"name":"passed","type":"bool"},{"name":"votesFor","type":"uint32"},{"name":"votesAgainst","type":"uint32"},{"name":"totalVotes","type":"uint32"},{"name":"model","type":"uint8"},{"name":"ts","type":"uint32"}],"name":"results","type":"tuple"}],"outputs":[]},{"name":"setProposalSI","inputs":[{"name":"c","type":"cell"}],"outputs":[]},{"name":"setPadawanSI","inputs":[{"name":"c","type":"cell"}],"outputs":[]},{"name":"updateABI","inputs":[{"name":"kind","type":"uint8"},{"name":"sabi","type":"bytes"}],"outputs":[]},{"name":"updateImage","inputs":[{"name":"kind","type":"uint8"},{"name":"image","type":"cell"}],"outputs":[]},{"name":"getImages","inputs":[],"outputs":[{"name":"padawan","type":"cell"},{"name":"proposal","type":"cell"}]},{"name":"getDeployed","inputs":[],"outputs":[{"components":[{"name":"ownerAddress","type":"address"},{"name":"addr","type":"address"}],"name":"padawans","type":"map(uint256,tuple)"},{"name":"proposals","type":"map(address,uint32)"}]},{"name":"getProposalInfo","inputs":[],"outputs":[{"components":[{"name":"id","type":"uint32"},{"name":"start","type":"uint32"},{"name":"end","type":"uint32"},{"name":"title","type":"bytes"},{"name":"ts","type":"uint32"},{"name":"proposalType","type":"uint8"},{"name":"specific","type":"cell"}],"name":"proposals","type":"map(uint32,tuple)"}]},{"name":"getProposalData","inputs":[],"outputs":[{"components":[{"name":"id","type":"uint32"},{"name":"state","type":"uint8"},{"name":"ownerAddress","type":"address"},{"name":"addr","type":"address"},{"name":"ts","type":"uint32"}],"name":"proposals","type":"map(uint32,tuple)"}]},{"name":"getStats","inputs":[],"outputs":[{"name":"version","type":"uint16"},{"name":"deployedPadawansCounter","type":"uint32"},{"name":"deployedProposalsCounter","type":"uint32"}]},{"name":"getPadawan","inputs":[{"name":"key","type":"uint256"}],"outputs":[{"components":[{"name":"ownerAddress","type":"address"},{"name":"addr","type":"address"}],"name":"data","type":"tuple"}]}],"data":[],"events":[]},"image":"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"}