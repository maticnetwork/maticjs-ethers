import { BaseContractMethod, ITransactionRequestConfig, ITransactionWriteResult, Logger } from "@maticnetwork/maticjs";
import { BigNumber, Contract, PopulatedTransaction } from "ethers";
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

    private toConfig_(config: ITransactionRequestConfig = {}) {
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

    estimateGas(config: ITransactionRequestConfig = {}) {
        return this.contract_.estimateGas[this.methodName](...this.args, this.toConfig_(config)).then(result => {
            return result.toNumber();
        });
    }

    read(config: ITransactionRequestConfig) {
        this.logger.log("sending tx with config", config);
        return this.getMethod_(config).then(result => {
            if (result._isBigNumber) {
                result = result.toString();
            }
            return result;
        });
    }

    private getMethod_(config: ITransactionRequestConfig = {}) {
        return this.contract_[this.methodName](...this.args, this.toConfig_(config));
    }

    write(config: ITransactionRequestConfig) {
        const result = {
            onTransactionHash: (doNothing as any),
            onReceiptError: doNothing,
            onTxError: doNothing,
            getReceipt: doNothing as any

        } as ITransactionWriteResult;
        this.logger.log("sending tx with config", config);
        this.getMethod_(config).then(response => {
            result.onTransactionHash(response.hash);
            result.getReceipt = () => {
                return response.wait().then(receipt => {
                    return ethReceiptToMaticReceipt(receipt)
                })
            }
        }).catch(err => {
            result.onTxError(err);
        });
        return result;
    }
}