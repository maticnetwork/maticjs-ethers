import { BaseContractMethod, ITransactionConfig, ITransactionWriteResult, Logger } from "@maticnetwork/maticjs";
import { BigNumber, Contract, ethers, PopulatedTransaction, utils } from "ethers";
import { doNothing } from "../helpers";
import { ethReceiptToMaticReceipt } from "../utils";

export class ContractMethod extends BaseContractMethod {
    constructor(logger: Logger, private contract_: Contract, private methodName, private args) {
        super(logger);
    }

    get address() {
        return this.contract_.address
    }

    toBigNumber(value) {
        return value ? BigNumber.from(value) : value;
    }

    private toConfig_(config: ITransactionConfig = {}) {
        const toBigNumber = this.toBigNumber;
        return {
            to: config.to,
            from: config.from,
            gasPrice: toBigNumber(config.gasPrice),
            gasLimit: toBigNumber(config.gasLimit),
            value: toBigNumber(config.value),
            nonce: config.nonce,
            // chainId: config.chainId,
            data: config.data,
            type: config.type,
            maxFeePerGas: toBigNumber(config.maxFeePerGas),
            maxPriorityFeePerGas: toBigNumber(config.maxPriorityFeePerGas),

        } as PopulatedTransaction;
    }

    encodeABI() {
        return this.contract_.interface.encodeFunctionData(this.methodName, this.args)
        // return this.contract_.interface.functions.encode[this.methodName](...this.args);
    }

    estimateGas(config: ITransactionConfig = {}) {
        return this.contract_.estimateGas[this.methodName](...this.args, this.toConfig_(config)).then(result => {
            return result.toNumber();
        });
    }

    read(config: ITransactionConfig) {
        this.logger.log("sending tx with config", config);
        return this.getMethod_(config).then(result => {
            if (result._isBigNumber) {
                result = result.toString();
            }
            return result;
        });
    }

    private getMethod_(config: ITransactionConfig = {}) {
        return this.contract_[this.methodName](...this.args, this.toConfig_(config));
    }

    write(config: ITransactionConfig) {
        const result = {
            onTransactionHash: (doNothing as any),
            onReceipt: doNothing,
            onReceiptError: doNothing,
            onTxError: doNothing
        } as ITransactionWriteResult;
        this.logger.log("sending tx with config", config);
        this.getMethod_(config).then(response => {
            result.onTransactionHash(response.hash);
            return response.wait();
        }).then(receipt => {
            result.onReceipt(
                ethReceiptToMaticReceipt(receipt)
            );
        }).catch(err => {
            result.onTxError(err);
            result.onReceiptError(err);
        });
        return result;
    }
}