const dotenv = require('dotenv');
const path = require('path');
const env = dotenv.config({
    path: path.join(__dirname, '.env')
});
module.exports = {
    rpc: {
        parent: process.env.ROOT_RPC,
        child: process.env.MATIC_RPC || 'https://rpc-amoy.polygon.technology',
    },
    pos: {
        parent: {
            erc20: '0xb480378044d92C96D16589Eb95986df6a97F2cFB',
            erc721: '0x421DbB7B5dFCb112D7a13944DeFB80b28eC5D22C',
            erc1155: '0x095DD31b6473c4a32548d2A5B09e0f2F3F30d8F1',
            chainManagerAddress: '0xb991E39a401136348Dee93C75143B159FabF483f',
        },
        child: {
            erc20: '0xf3202E7270a10E599394d8A7dA2F4Fbd475e96bA',
            erc721: '0x02f83d4110D3595872481f677Ae323D50Aa09209',
            erc1155: '0x488AfDFef019f511E343becb98B7c24ee02fA639',
        },
    },
    user1: {
        "privateKey": process.env.USER1_PRIVATE_KEY,
        "address": process.env.USER1_FROM
    },
    user2: {
        address: process.env.USER2_FROM, // Your address
        "privateKey": process.env.USER2_PRIVATE_KEY,
    },
}
