import { ITransactionConfig, IPlugin, ITransactionResult } from "@maticnetwork/maticjs";
import { BigNumber, ethers } from "ethers";
import { EtherWeb3Client } from "./ethers";


export class Web3ClientPlugin implements IPlugin {
    setup(matic) {
        matic.utils.Web3Client = EtherWeb3Client as any;
        matic.utils.isBN = (value) => {
            return BigNumber.isBigNumber(value);
        }
    }
}

export * from "./ethers";
export default Web3ClientPlugin;