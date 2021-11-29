import { POSClient, use } from "@maticnetwork/maticjs";
import { Web3ClientPlugin } from "@maticnetwork/maticjs-ethers";
import { ethers } from "ethers";

import { pos } from "../../config";

use(Web3ClientPlugin);
const posClient = new POSClient();

window.onload = () => {
    document.querySelector('#btnConnect').addEventListener('click', async () => {
        if (!window.ethereum) {
            return alert("Metamask not installed or not enabled");
        }
        await window.ethereum.enable();

        const from = window.ethereum.selectedAddress;

        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();

        const chainId = await signer.getChainId();

        // if network is goerli, then it is parent
        const isParent = chainId === 5;


        await posClient.init({
            log: true,
            network: "testnet",
            version: 'mumbai',
            parent: {
                provider: provider,
                defaultConfig: {
                    from: from
                }
            },
            child: {
                provider: provider,
                defaultConfig: {
                    from: from
                }
            }
        });

        const tokenAddress = isParent ? pos.parent.erc20 : pos.child.erc20;

        const erc20Token = posClient.erc20(
            tokenAddress
            , isParent
        )

        const balance = await erc20Token.getBalance(from);

        console.log("balance", balance);

        alert(`your balance is ${balance}`);
    })
}



