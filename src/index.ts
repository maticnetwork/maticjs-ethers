import { ITransactionRequestConfig, IPlugin, ITransactionResult, Converter, utils } from "@maticnetwork/maticjs";
import { BigNumber, ethers } from "ethers";
import { EtherWeb3Client } from "./ethers";
import { MaticBigNumber } from "./utils";


export class Web3ClientPlugin implements IPlugin {
    setup(matic) {
        matic.utils.Web3Client = EtherWeb3Client as any;
        matic.utils.BN = MaticBigNumber;
        matic.utils.isBN = (value) => {
            return BigNumber.isBigNumber(value);
        };
    }
}

export * from "./ethers";

/* tslint:disable-next-line */
export default Web3ClientPlugin;