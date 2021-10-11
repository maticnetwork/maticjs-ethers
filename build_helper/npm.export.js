if (process.env.NODE_ENV === 'production') {
    module.exports = require('./matic-ethers.node.min.js')
} else {
    module.exports = require('./matic-ethers.node.js')
}
