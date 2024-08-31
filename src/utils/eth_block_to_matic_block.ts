import { IBlock } from "@maticnetwork/maticjs";
import { Block } from "ethers";
import BigNumber from "bignumber.js";

export const ethBlockToMaticBlock = (block: Block) => {
    const newBlock = block.toJSON();
    newBlock.gasUsed = new BigNumber(newBlock.gasUsed.toString()).toNumber() as any;
    newBlock.gasLimit = new BigNumber(newBlock.gasLimit.toString()).toNumber() as any;
    if ((newBlock as any).baseFeePerGas) {
        (newBlock as any).baseFeePerGas = new BigNumber(newBlock.baseFeePerGas.toString()).toNumber() as any;
    }
    return newBlock as IBlock;
};
