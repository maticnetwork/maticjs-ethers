import {
    Wallet, Contract, ethers,
    JsonRpcProvider,
    JsonRpcSigner,
    BrowserProvider,
    AbiCoder
} from "ethers";
import BigNumber from "bignumber.js";
import { EthJsContract } from "./ethjs_contract";
import { doNothing } from "../helpers";
import {
    BaseWeb3Client, IError, IJsonRpcRequestPayload, IJsonRpcResponse,
    ITransactionRequestConfig, ITransactionWriteResult
} from "@maticnetwork/maticjs";
import { ethBlockToMaticBlock, ethReceiptToMaticReceipt, ethTxToMaticTx } from "../utils";

type ETHER_PROVIDER = JsonRpcProvider;
type ETHER_SIGNER = JsonRpcSigner;
type WEB3_PROVIDER = BrowserProvider;

export class EtherWeb3Client extends BaseWeb3Client {
    name = 'ETHER';
    provider: ETHER_PROVIDER | WEB3_PROVIDER;
    signer: ETHER_SIGNER;

    constructor(provider: ETHER_PROVIDER | Wallet | WEB3_PROVIDER, logger) {
        super(logger);

        if (provider instanceof BrowserProvider) {
            this.provider = provider;
            provider.getSigner().then((signer) => {
                this.signer = signer;
            });
        } else if (provider instanceof JsonRpcProvider) {
            this.provider = provider;
            this.signer = provider as any;
        } else {
            this.signer = provider as any;
            this.provider = provider.provider || provider as any;
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
            [ethers.toQuantity(blockHashOrBlockNumber), true]
        ).then(rawBlock => {
            const block = {
                ...rawBlock,
                stateRoot: ethers.zeroPadValue(rawBlock.stateRoot, 32),
                transactionsRoot: ethers.zeroPadValue(rawBlock.transactionsRoot, 32),
                receiptsRoot: ethers.zeroPadValue(rawBlock.receiptsRoot, 32),
            };

            block.transactions = block.transactions.map(tx => {
                return ethTxToMaticTx(tx as any);
            }) as any;

            return ethBlockToMaticBlock(block) as any;
        });
    }


    getChainId() {
        return this.signer.provider.getNetwork().then(network => {
            return new BigNumber(network.chainId.toString()).toNumber();
        });
    }

    getBalance(address) {
        return this.provider.getBalance(address).then(balance => {
            return balance.toString();
        });
    }

    getAccounts() {
        return this.signer.getAddress().then(address => {
            return [address];
        });
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
        return this.provider.getFeeData().then(result => {
            return result.gasPrice.toString();
        });
    }

    estimateGas(config) {
        return this.provider.estimateGas(
            this.toEthTxConfig_(config)
        ).then(value => {
            return new BigNumber(value.toString()).toNumber();
        });
    }

    encodeParameters(params: any[], types: any[]) {
        return AbiCoder.defaultAbiCoder().encode(types, params);
    }

    toHex(value, returnType) {

        if (ethers.isAddress(value)) {
            return returnType ? 'address' : '0x' + value.toLowerCase().replace(/^0x/i, '');
        }

        if (typeof value === 'boolean') {
            return returnType ? 'bool' : value ? '0x01' : '0x00';
        }

        if (Buffer.isBuffer(value)) {
            return '0x' + value.toString('hex');
        }

        if (typeof value === 'object' && !!value && !BigNumber.isBigNumber(value)) {
            return returnType ? 'string' : ethers.toBeHex(JSON.stringify(value));
        }

        // if its a negative number, pass it through numberToHex
        if (typeof value === 'string') {
            if (value.indexOf('-0x') === 0 || value.indexOf('-0X') === 0) {
                return returnType ? 'int256' : ethers.toBeHex(value);
            } else if (value.indexOf('0x') === 0 || value.indexOf('0X') === 0) {
                return returnType ? 'bytes' : value;
            } else if (!isFinite(value as any)) {
                return returnType ? 'string' : ethers.toBeHex(value);
            }
        }

        return returnType ? (value < 0 ? 'int256' : 'uint256') : ethers.toBeHex(value);
    }

    hexToNumber(value) {
        return new BigNumber(value).toNumber();
    }

    hexToNumberString(value) {
        return new BigNumber(value).toString();
    }

    signTypedData(signer, typedData) {
        const { domain, types, message: value } = typedData;
        if (types.EIP712Domain) {
            delete types.EIP712Domain;
        }
        return this.signer.signTypedData(domain, types, value);
    }

    etheriumSha3(...value) {
        const types = value.map(val => {
            return this.toHex(val, true);
        });
        return ethers.solidityPackedKeccak256(types, value);
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
        return AbiCoder.defaultAbiCoder().decode(types, hexString) as any;
    }

}
