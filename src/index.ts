import { ITransactionConfig, IPlugin, ITransactionResult } from "@maticnetwork/maticjs";
import { EtherWeb3Client } from "./ethers";


export class Web3ClientPlugin implements IPlugin {
    setup(matic) {
        matic.Web3Client = EtherWeb3Client as any;
    }
}

export default Web3ClientPlugin;