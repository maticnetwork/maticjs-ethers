import { IBlock } from "@maticnetwork/maticjs";
import { providers } from "ethers";

export const ethBlockToMaticBlock = (block: providers.Block) => {
    block.gasUsed = block.gasUsed.toNumber() as any;
    block.gasLimit = block.gasLimit.toNumber() as any;
    if ((block as any).baseFeePerGas) {
        (block as any).baseFeePerGas = block.baseFeePerGas.toHexString();
    }
    return block as any as IBlock;
};
