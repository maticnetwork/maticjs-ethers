import { ITransactionReceipt } from "@maticnetwork/maticjs";
import { providers } from "ethers";

export const ethReceiptToMaticReceipt = (receipt: providers.TransactionReceipt) => {
    receipt.gasUsed = receipt.gasUsed.toNumber() as any;
    receipt.cumulativeGasUsed = receipt.cumulativeGasUsed.toNumber() as any;

    return receipt as any as ITransactionReceipt;
}