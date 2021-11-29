const { use, POSClient } = require("@maticnetwork/maticjs");
const { Web3ClientPlugin } = require("@maticnetwork/maticjs-ethers");
const { providers, Wallet } = require("ethers");

const dotenv = require('dotenv');
const path = require('path');
const env = dotenv.config({
    path: path.join(__dirname, '.env')
});

const { user1, rpc, pos } = require("./config");

use(Web3ClientPlugin);

const from = user1.address;
const privateKey = user1.privateKey;

const execute = async () => {

    const parentPrivder = new providers.JsonRpcProvider(rpc.root);
    const childProvider = new providers.JsonRpcProvider(rpc.child);

    const matic = new POSClient();
    await matic.init({
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

    const rootTokenErc20 = matic.erc20(pos.parent.erc20, true);

    const balanceRoot = await rootTokenErc20.getBalance(from)
    console.log('balanceRoot', balanceRoot);
}

execute().then(_ => {
    process.exit(0)
}).catch(err => {
    console.error("error", err);
    process.exit(0);
})
