import { BaseContractMethod, ITransactionConfig, ITransactionWriteResult, Logger } from "@maticnetwork/maticjs";
import { Contract, PopulatedTransaction } from "ethers";
import { doNothing } from "../helpers";

export class ContractMethod extends BaseContractMethod {
    constructor(logger: Logger, private contract_: Contract, private methodName, private args) {
        super(logger);
    }

    get address() {
        return this.contract_.address
    }

    private toConfig_(config: ITransactionConfig = {}) {
        return {
            to: config.to,
            from: config.from,
            gasPrice: config.gasPrice as any,
            gasLimit: config.gasLimit as any,
            value: config.value as any,
            nonce: config.nonce,
            // chainId: config.chainId,
            data: config.data,
            type: config.type as any,
            maxFeePerGas: config.maxFeePerGas as any,
            maxPriorityFeePerGas: config.maxPriorityFeePerGas as any
        } as PopulatedTransaction;
    }

    encodeABI() {
        return this.contract_.interface.functions.encode[this.methodName](...this.args);
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
            result.onReceipt(receipt);
        }).catch(err => {
            result.onTxError(err);
            result.onReceiptError(err);
        });
        return result;
    }
}