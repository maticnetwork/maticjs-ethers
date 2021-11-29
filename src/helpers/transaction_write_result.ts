import { ITransactionWriteResult } from "@maticnetwork/maticjs";
import { providers } from "ethers";
import { ethReceiptToMaticReceipt } from "../utils";
import { doNothing } from "./do_nothing";

export class TransactionWriteResult implements ITransactionWriteResult {

    onTransactionHash = doNothing as any;
    onTransactionError = doNothing as any;

    onTransactionReceipt: Function;

    getReceipt() {
        return new Promise<providers.TransactionReceipt>((res, rej) => {
            this.onTransactionReceipt = res;
            this.onTransactionError = rej;
        }).then(receipt => {
            return ethReceiptToMaticReceipt(receipt);
        });
    }

    constructor(private promise: Promise<providers.TransactionResponse>) {
        promise.then(response => {
            this.onTransactionHash(response.hash);
            setTimeout(() => {
                if (this.onTransactionReceipt) {
                    response.wait().then(receipt => {
                        this.onTransactionReceipt(receipt);
                    });
                }
            }, 0);
        }).catch(err => {
            this.onTransactionError(err);
        });
    }

    getTransactionHash() {
        return new Promise<string>((res, rej) => {
            this.onTransactionHash = res;
            this.onTransactionError = rej;
        });
    }
}
