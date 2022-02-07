import { providers, Wallet, utils, Contract, ethers, BigNumber } from "ethers";
import { EthJsContract } from "./ethjs_contract";
import { doNothing } from "../helpers";
import { BaseWeb3Client, IBlockWithTransaction, IError, IJsonRpcRequestPayload, IJsonRpcResponse, ITransactionRequestConfig, ITransactionWriteResult } from "@maticnetwork/maticjs";
import { ethBlockToMaticBlock, ethReceiptToMaticReceipt, ethTxToMaticTx } from "../utils";

type ETHER_PROVIDER = providers.JsonRpcProvider;
type ETHER_SIGNER = providers.JsonRpcSigner;

export class EtherWeb3Client extends BaseWeb3Client {

    provider: ETHER_PROVIDER;
    signer: ETHER_SIGNER;

    constructor(provider: ETHER_PROVIDER | Wallet, logger) {
        super(logger);
        if ((provider as ETHER_PROVIDER)._isProvider) {
            this.provider = provider as ETHER_PROVIDER;
            this.signer = this.provider.getSigner();
        }
        else {
            this.signer = (provider as any);
            this.provider = ((provider as Wallet).provider) as any;
        }
    }



    getBlock(blockHashOrBlockNumber) {
        return this.provider.getBlock(blockHashOrBlockNumber).then(block => {
            return block as any;
        });
    }

    getBlockWithTransaction(blockHashOrBlockNumber) {
        // return this.provider.getBlockWithTransactions(blockHashOrBlockNumber)
        const provider = this.provider;
        return provider.send(
            'eth_getBlockByNumber',
            [utils.hexValue(blockHashOrBlockNumber), true]
        ).then(rawBlock => {
            const block = provider.formatter.blockWithTransactions(rawBlock);
            block['stateRoot'] = provider.formatter.hash(rawBlock.stateRoot);
            block['transactionsRoot'] = provider.formatter.hash(rawBlock.transactionsRoot);
            block['receiptsRoot'] = provider.formatter.hash(rawBlock.receiptsRoot);

            block.transactions = block.transactions.map(tx => {
                return ethTxToMaticTx(tx as any);
            }) as any;

            return ethBlockToMaticBlock(block) as any;
        });
    }


    getChainId() {
        return this.signer.getChainId();
    }

    private ensureTransactionNotNull_(data) {
        if (!data) {
            throw {
                type: 'invalid_transaction' as any,
                message: 'Could not retrieve transaction. Either it is invalid or might be in archive node.'
            } as IError;
        }
    }

    getTransaction(transactionHash: string) {
        return this.provider.getTransaction(transactionHash).then(result => {
            this.ensureTransactionNotNull_(result);

            return ethTxToMaticTx(result);
        });
    }

    getTransactionCount(address: string, blockNumber: any) {
        return this.provider.getTransactionCount(address, blockNumber);
    }

    getTransactionReceipt(transactionHash: string) {
        return this.provider.getTransactionReceipt(transactionHash).then(result => {
            this.ensureTransactionNotNull_(result);
            
            return ethReceiptToMaticReceipt(result);
        });
    }

    getGasPrice() {
        return this.provider.getGasPrice().then(result => {
            return result.toString();
        });
    }

    estimateGas(config) {
        return this.provider.estimateGas(
            this.toEthTxConfig_(config)
        ).then(value => {
            return value.toNumber();
        });
    }

    encodeParameters(params: any[], types: any[]) {
        return utils.defaultAbiCoder.encode(types, params);
    }

    toHex(value, returnType) {

        if (utils.isAddress(value)) {
            return returnType ? 'address' : '0x' + value.toLowerCase().replace(/^0x/i, '');
        }

        if (typeof value === 'boolean') {
            return returnType ? 'bool' : value ? '0x01' : '0x00';
        }

        if (Buffer.isBuffer(value)) {
            return '0x' + value.toString('hex');
        }

        if (typeof value === 'object' && !!value && !BigNumber.isBigNumber(value)) {
            return returnType ? 'string' : utils.hexlify(JSON.stringify(value));
        }

        // if its a negative number, pass it through numberToHex
        if (typeof value === 'string') {
            if (value.indexOf('-0x') === 0 || value.indexOf('-0X') === 0) {
                return returnType ? 'int256' : utils.hexlify(value);
            } else if (value.indexOf('0x') === 0 || value.indexOf('0X') === 0) {
                return returnType ? 'bytes' : value;
            } else if (!isFinite(value as any)) {
                return returnType ? 'string' : utils.hexlify(value);
            }
        }

        return returnType ? (value < 0 ? 'int256' : 'uint256') : utils.hexlify(value);
    }

    etheriumSha3(...value) {
        const types = value.map(val => {
            return this.toHex(val, true);
        });
        return utils.solidityKeccak256(types, value);
    }

    sendRPCRequest(request: IJsonRpcRequestPayload) {
        return this.provider.send(request.method, request.params).then(result => {
            return {
                result: result
            } as IJsonRpcResponse;
        });
    }

    private toEthTxConfig_(config: ITransactionRequestConfig) {
        return {
            chainId: config.chainId,
            data: config.data,
            from: config.from as any,
            gasLimit: config.gasLimit,
            gasPrice: config.gasPrice as any,
            nonce: config.nonce,
            to: config.to,
            value: config.value as any
        };
    }

    write(config: ITransactionRequestConfig) {
        let onTransactionHash = doNothing as any;
        let onTransactionError = doNothing as any;

        const result = {
            getTransactionHash() {
                return new Promise(res => {
                    onTransactionHash = res;
                });
            }
        } as ITransactionWriteResult;
        this.signer.sendTransaction(
            this.toEthTxConfig_(config)
        ).then(response => {
            onTransactionHash(response.hash);
            result.getReceipt = () => {
                return response.wait().then(receipt => {
                    return ethReceiptToMaticReceipt(receipt);
                });
            };
        }).catch(err => {
            onTransactionError = err;
        });
        return result;
    }

    read(config: ITransactionRequestConfig) {
        return this.signer.call(
            this.toEthTxConfig_(config)
        );
    }

    getContract(address: string, abi: any) {
        return new EthJsContract(
            address,
            new Contract(address, abi, this.signer),
            this.logger
        );
    }

    decodeParameters(hexString, types: any[]) {
        return utils.defaultAbiCoder.decode(types, hexString) as any;
    }

}
