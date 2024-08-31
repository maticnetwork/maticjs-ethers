import { ITransactionReceipt } from "@maticnetwork/maticjs";
import { TransactionReceipt } from "ethers";
import BigNumber from "bignumber.js";

export const ethReceiptToMaticReceipt = (receipt: TransactionReceipt) => {
    const maticReceipt: ITransactionReceipt = receipt as any;
    maticReceipt.gasUsed = new BigNumber(receipt.gasUsed.toString()).toNumber();
    maticReceipt.cumulativeGasUsed = new BigNumber(receipt.cumulativeGasUsed.toString()).toNumber();

    return maticReceipt;
};
