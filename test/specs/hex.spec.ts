import { expect } from 'chai'
import { Converter, utils } from '@maticnetwork/maticjs'

describe('Hex test', () => {


    it('Converter.toHex', () => {
        const value = Converter.toHex('10');

        expect(value).equal('0xa');
    })

    it('BigNumber.toHex', () => {
        const value = new utils.BN('10').toString(16)

        expect(value).equal('a');
    })

    it('Converter.toHex with big number', () => {
        const value = Converter.toHex(
            new utils.BN(10)
        );

        expect(value).equal('0xa');
    })

});