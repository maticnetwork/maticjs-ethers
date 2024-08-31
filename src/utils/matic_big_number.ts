import { BaseBigNumber } from "@maticnetwork/maticjs";
import { stripZerosLeft, hexlify } from "ethers";
import BigNumber from "bignumber.js";

export class MaticBigNumber extends BaseBigNumber {
    private bn_: BigNumber;

    constructor(value) {
        super();
        this.bn_ = new BigNumber(value);
    }

    static isBN(value) {
        if (value instanceof MaticBigNumber) {
            return true;
        }
        return BigNumber.isBigNumber(value);
    }

    toString(base?) {
        if (base === 16) {
            let hex = this.bn_.toString(16);
            hex = hexlify(stripZerosLeft(hex))
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
        const bn = this.bn_.plus(
            new BigNumber(value.toString())
        );
        return new MaticBigNumber(bn);
    }

    sub(value: BaseBigNumber) {
        const bn = this.bn_.minus(
            new BigNumber(value.toString())
        );
        return new MaticBigNumber(bn);
    }

    mul(value: BaseBigNumber) {
        const bn = this.bn_.times(
            new BigNumber(value.toString())
        );
        return new MaticBigNumber(bn);
    }

    div(value: BaseBigNumber) {
        const bn = this.bn_.div(
            new BigNumber(value.toString())
        );
        return new MaticBigNumber(bn);
    }

    lte(value: BaseBigNumber) {
        return this.bn_.lte(
            new BigNumber(value.toString())
        );
    }

    lt(value: BaseBigNumber) {
        return this.bn_.lt(
            new BigNumber(value.toString())
        );
    }

    gte(value: BaseBigNumber) {
        return this.bn_.gte(
            new BigNumber(value.toString())
        );
    }

    gt(value: BaseBigNumber) {
        return this.bn_.gt(
            new BigNumber(value.toString())
        );
    }

    eq(value: BaseBigNumber) {
        return this.bn_.eq(
            new BigNumber(value.toString())
        );
    }
}
