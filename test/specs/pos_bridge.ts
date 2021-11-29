import { erc721, from, posClient, posClientForTo, privateKey, RPC, to, toPrivateKey } from "./client";
import { expect } from 'chai'
import { ABIManager } from '@maticnetwork/maticjs'
import { providers, Wallet } from "ethers";

describe('POS Client', () => {

    const abiManager = new ABIManager("testnet", "mumbai");
    const parentPrivder = new providers.JsonRpcProvider(RPC.parent);
    const childProvider = new providers.JsonRpcProvider(RPC.child);

    before(() => {
        return Promise.all([
            abiManager.init()
        ]);
    });

    it("pos client from init", async () => {
        await posClient.init({
            // log: true,
            network: 'testnet',
            version: 'mumbai',
            parent: {
                provider: new Wallet(privateKey, parentPrivder),
                defaultConfig: {
                    from
                }
            },
            child: {
                provider: new Wallet(privateKey, childProvider),
                defaultConfig: {
                    from
                }
            }
        });
    })

    it("pos client to init", async () => {
        await posClientForTo.init({
            // log: true,
            network: 'testnet',
            version: 'mumbai',
            parent: {
                provider: new Wallet(toPrivateKey, parentPrivder),
                defaultConfig: {
                    from: to
                }
            },
            child: {
                provider: new Wallet(toPrivateKey, childProvider),
                defaultConfig: {
                    from: to
                }
            }
        });
    })
});
