import { IBlock, ITransactionData, ITransactionResult } from "@maticnetwork/maticjs";
import { providers } from "ethers";

export const ethTxToMaticTx = (tx: providers.TransactionResponse) => {
    const maticTx: ITransactionData = tx as any;
    maticTx.gasPrice = tx.gasPrice.toString();
    maticTx.gas = tx.gasLimit.toNumber();
    (maticTx as any).gasLimit = tx.gasLimit.toNumber();
    maticTx.value = tx.value.toString();
    maticTx.transactionHash = tx.hash;

    return maticTx;
};
