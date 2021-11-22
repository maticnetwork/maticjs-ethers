[![TEST](https://github.com/maticnetwork/maticjs-ethers/actions/workflows/test.yml/badge.svg)](https://github.com/maticnetwork/maticjs-ethers/actions/workflows/test.yml) [![npm version](https://badge.fury.io/js/@maticnetwork%2Fmaticjs-ethers.svg)](https://badge.fury.io/js/@maticnetwork%2Fmaticjs-ethers)
# maticjs-ethers
ethers plugin for matic.js

# Installation

```
npm i @maticnetwork/maticjs-ethers
```
# Docs

```

import { use } from '@maticnetwork/maticjs'
import { Web3ClientPlugin } from '@maticnetwork/maticjs-ethers'

// install ethers plugin
use(Web3ClientPlugin)
```

That's all you need to do and `ethers` will be used for web3 calls.
