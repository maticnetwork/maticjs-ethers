import { erc721, from, posClient } from "./client";
import { expect } from 'chai'
import { ABIManager } from '@maticnetwork/maticjs'

describe('POS Client', () => {

    const abiManager = new ABIManager("testnet", "mumbai");
    before(() => {
        return Promise.all([
            posClient.init(),
            abiManager.init()
        ]);
    });

    
});