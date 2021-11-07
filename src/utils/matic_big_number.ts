import { BaseBigNumber } from "@maticnetwork/maticjs";
import { BigNumber, utils } from "ethers";

export class MaticBigNumber extends BaseBigNumber {
    private bn_: BigNumber;

    constructor(value) {
        super();
        this.bn_ = BigNumber.from(value);
    }

    static isBN(value) {
        if (value instanceof MaticBigNumber) {
            return true;
        }
        return BigNumber.isBigNumber(value);
    }

    toString(base?) {
        if (base === 16) {
            let hex = this.bn_.toHexString();
            hex = utils.hexStripZeros(hex);
            return hex.indexOf('0x') === 0 ? hex.slice(2) : hex;
        }
        return this.bn_.toString();
    }

    toNumber() {
        return this.bn_.toNumber();
    }

    toBuffer() {
        return (this as any).bn_.toBuffer();
    }

    add(value: BaseBigNumber) {
        const bn = this.bn_.add(
            BigNumber.from(value.toString())
        );
        return new MaticBigNumber(bn);
    }

    sub(value: BaseBigNumber) {
        const bn = this.bn_.sub(
            BigNumber.from(value.toString())
        );
        return new MaticBigNumber(bn);
    }

    mul(value: BaseBigNumber) {
        const bn = this.bn_.mul(
            BigNumber.from(value.toString())
        );
        return new MaticBigNumber(bn);
    }

    div(value: BaseBigNumber) {
        const bn = this.bn_.div(
            BigNumber.from(value.toString())
        );
        return new MaticBigNumber(bn);
    }

    lte(value: BaseBigNumber) {
        return this.bn_.lte(
            BigNumber.from(value.toString())
        );
    }

    lt(value: BaseBigNumber) {
        return this.bn_.lt(
            BigNumber.from(value.toString())
        );
    }

    gte(value: BaseBigNumber) {
        return this.bn_.gte(
            BigNumber.from(value.toString())
        );
    }

    gt(value: BaseBigNumber) {
        return this.bn_.gt(
            BigNumber.from(value.toString())
        );
    }

    eq(value: BaseBigNumber) {
        return this.bn_.eq(
            BigNumber.from(value.toString())
        );
    }
}