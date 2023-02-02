const HDWalletProvider = require('@truffle/hdwallet-provider');
const Web3 = require('web3');
const compiledFactory = require('./build/PromoDataFactory.json')

const provider = new HDWalletProvider(
    'AAAABBBBCCCCDDDD', 
    'https://goerli.infura.io/v3/6af8e514004e4114a1adb05891b62565'
);
const web3 = new Web3(provider);

const deploy = async () => {
    const accounts = await web3.eth.getAccounts();
    const balance = await web3.eth.getBalance(accounts[0])
    const gasPrice = await web3.eth.getGasPrice()
    console.log(`balance: ${balance}, gasPrice: ${gasPrice}`)
    console.log('Attempting to deploy from account', accounts[0]);
    const result = await new web3.eth.Contract(compiledFactory.abi)
        .deploy({
            data: compiledFactory.evm.bytecode.object
        })
        .send({
            from:accounts[0], 
            gas: '10000000'
        });
    console.log('Contract deployed to', result.options.address);
    provider.engine.stop();
};
deploy();
