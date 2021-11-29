import { ITransactionReceipt } from "@maticnetwork/maticjs";
import { providers } from "ethers";

export const ethReceiptToMaticReceipt = (receipt: providers.TransactionReceipt) => {

    const maticReceipt: ITransactionReceipt = receipt as any;

    maticReceipt.gasUsed = receipt.gasUsed.toNumber();
    maticReceipt.cumulativeGasUsed = receipt.cumulativeGasUsed.toNumber();

    return maticReceipt;
};
