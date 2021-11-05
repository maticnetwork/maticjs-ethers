import { erc20, from, posClient, posClientForTo, to } from "./client";
import { expect } from 'chai'
import BN from "bn.js";
import { ITransactionConfig } from "@maticnetwork/maticjs";
import { ContractMethod } from "@maticnetwork/maticjs-ethers";
import { ethers } from "ethers";


describe('ERC20', () => {

    let erc20Child = posClient.erc20(erc20.child);
    let erc20Parent = posClient.erc20(erc20.parent, true);
    before(() => {
        return posClient.init();
    });

    it('get balance child', async () => {
        console.log('process.env.NODE_ENV', process.env.NODE_ENV);

        const balance = await erc20Child.getBalance(from);
        console.log('balance', balance);
        expect(balance).to.be.an('string');
        expect(Number(balance)).gte(0);
    })

    it('get balance parent', async () => {
        const balance = await erc20Parent.getBalance(from);
        console.log('balance', balance);
        expect(balance).to.be.an('string');
        expect(Number(balance)).gte(0);
    })

    it('get allowance', async () => {
        const allowance = await erc20Parent.getAllowance(from);
        expect(allowance).to.be.an('string');
        expect(Number(allowance)).gte(0);
    })

    it('is check pointed', async () => {
        const isCheckPointed = await posClient.isCheckPointed('0xd6f7f4c6052611761946519076de28fbd091693af974e7d4abc1b17fd7926fd7');
        expect(isCheckPointed).to.be.an('boolean').equal(true);
    })

    it('isWithdrawExited', async () => {
        const exitTxHash = '0x95844235073da694e311dc90476c861e187c36f86a863a950534c9ac2b7c1a48';
        const isExited = await erc20Parent.isWithdrawExited(
            '0xd6f7f4c6052611761946519076de28fbd091693af974e7d4abc1b17fd7926fd7'
        );
        expect(isExited).to.be.an('boolean').equal(true);
    })

    it('isDeposited', async () => {
        const txHash = '0xc67599f5c967f2040786d5924ec55d37bf943c009bdd23f3b50e5ae66efde258';
        const isDeposited = await posClient.isDeposited(txHash);
        expect(isDeposited).to.be.an('boolean').equal(true);
    })

    it('check for config props', async () => {
        const contract = await erc20Parent.getContract();
        const method = contract.method("transfer", to, 10) as ContractMethod
        const txConfig = {
            from: '0xfd71dc9721d9ddcf0480a582927c3dcd42f3064c',
            maxPriorityFeePerGas: 2000000000,
            chainId: 5,
            gasLimit: 26624,
            nonce: 2980,
            type: 0,
            maxFeePerGas: 20,
            data: 'ddd',
            gasPrice: 12345,
            hardfork: 'true',
            to: '12233',
            value: 1245
        } as ITransactionConfig;

        const config = method['toConfig_'](txConfig);

        const configLength = Object.keys(config).length;
        const txConfigLength = Object.keys(txConfig).length - 2;

        // console.log("configLength", config, configLength,
        //     "txConfigLength", txConfig, txConfigLength);

        expect(configLength).equal(
            txConfigLength
        )

        expect(config.from).equal(txConfig.from);
        expect(config.maxPriorityFeePerGas).deep.equal(
            ethers.BigNumber.from(txConfig.maxPriorityFeePerGas)
        );
        // expect(config.chainId).equal(txConfig.chainId);
        expect(config.gasLimit).deep.equal(
            ethers.BigNumber.from(txConfig.gasLimit)
        );
        expect(config.nonce).equal(txConfig.nonce);
        expect(config.type).equal(txConfig.type);
        expect(config.maxFeePerGas).deep.equal(
            ethers.BigNumber.from(txConfig.maxFeePerGas)
        );
        expect(config.data).equal(txConfig.data);
        expect(config.gasPrice).deep.equal(
            ethers.BigNumber.from(txConfig.gasPrice)
        );
        expect(config.to).equal(txConfig.to);
        expect(config.value).deep.equal(
            ethers.BigNumber.from(txConfig.value)
        );

    })

    return;

    it('child transfer returnTransaction with erp1159', async () => {
        const amount = 10;
        try {
            const result = await erc20Child.transfer(amount, to, {
                maxFeePerGas: 10,
                maxPriorityFeePerGas: 10,
                returnTransaction: true
            });
            console.log('result', result);
        } catch (error) {
            console.log('error', error);
            expect(error).deep.equal({
                message: `Child chain doesn't support eip-1559`,
                type: 'eip-1559_not_supported'
            })
        }
    });

    it('child transfer returnTransaction', async () => {
        const amount = 10;
        const txConfig = await erc20Child.transfer(amount, to, {
            returnTransaction: true
        }) as ITransactionConfig;
        console.log('result', txConfig);
        expect(txConfig).to.have.not.property('maxFeePerGas')
        expect(txConfig).to.have.not.property('maxPriorityFeePerGas')
        expect(txConfig).to.have.property('gasPrice')
        expect(txConfig).to.have.property('chainId', 80001);
    });

    it('parent transfer returnTransaction with erp1159', async () => {
        const amount = 10;
        const result = await erc20Parent.transfer(amount, to, {
            maxFeePerGas: 20,
            maxPriorityFeePerGas: 20,
            returnTransaction: true
        });
        console.log('result', result);

        expect(result).to.have.property('maxFeePerGas', 20)
        expect(result).to.have.property('maxPriorityFeePerGas', 20)
        expect(result).to.have.not.property('gasPrice')
        expect(result).to.have.property('chainId', 5);

    });

    it('child transfer', async () => {
        const oldBalance = await erc20Child.getBalance(to);
        console.log('oldBalance', oldBalance);
        const amount = 10;
        let result = await erc20Child.transfer(amount, to);
        let txHash = await result.getTransactionHash();
        expect(txHash).to.be.an('string');
        console.log('txHash', txHash);
        let txReceipt = await result.getReceipt();
        console.log("txReceipt", txReceipt);

        expect(txReceipt.transactionHash).equal(txHash);
        expect(txReceipt).to.be.an('object');
        expect(txReceipt.from.toLowerCase()).equal(from.toLowerCase());
        expect(txReceipt.to.toLowerCase()).equal(erc20.child.toLowerCase());
        expect(txReceipt.type).equal(0);
        expect(txReceipt.gasUsed).to.be.an('number').gt(0);
        expect(txReceipt.cumulativeGasUsed).to.be.an('number').gt(0);

        expect(txReceipt).to.have.property('blockHash')
        expect(txReceipt).to.have.property('blockNumber');
        expect(txReceipt).to.have.property('events');
        // expect(txReceipt).to.have.property('logs');
        expect(txReceipt).to.have.property('logsBloom');
        expect(txReceipt).to.have.property('status');
        expect(txReceipt).to.have.property('transactionIndex');

        const newBalance = await erc20Child.getBalance(to);
        console.log('newBalance', newBalance);

        const oldBalanceBig = new BN(oldBalance);
        const newBalanceBig = new BN(newBalance);

        expect(newBalanceBig.toString()).equal(
            oldBalanceBig.add(new BN(amount)).toString()
        )

        // transfer money back to user
        await posClientForTo.init();
        const erc20ChildToken = posClientForTo.erc20(erc20.child);

        result = await erc20ChildToken.transfer(amount, to);
        txHash = await result.getTransactionHash();
        txReceipt = await result.getReceipt();

    });

    if (process.env.NODE_ENV !== 'test_all') return;

    it('approve', async () => {
        const result = await erc20Parent.approve('10');

        const txHash = await result.getTransactionHash();
        expect(txHash).to.be.an('string');

        const txReceipt = await result.getReceipt();
        console.log("txReceipt", txReceipt);
        expect(txReceipt.type).equal('0x0');
    });

    it('deposit', async () => {
        const result = await erc20Parent.deposit('10', from);

        const txHash = await result.getTransactionHash();
        expect(txHash).to.be.an('string');

        const txReceipt = await result.getReceipt();
        expect(txReceipt).to.be.an('object');
    });

});