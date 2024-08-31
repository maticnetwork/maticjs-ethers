import { ITransactionData } from "@maticnetwork/maticjs";
import BigNumber from "bignumber.js";
import { TransactionResponse } from "ethers";

export const ethTxToMaticTx = (tx: TransactionResponse) => {
    const maticTx: ITransactionData = tx as any;
    maticTx.gasPrice = tx.gasPrice.toString();
    maticTx.gas = new BigNumber(tx.gasLimit.toString()).toNumber();
    (maticTx as any).gasLimit = new BigNumber(tx.gasLimit.toString()).toNumber();
    maticTx.value = tx.value.toString();
    maticTx.transactionHash = tx.hash;

    return maticTx;
};
