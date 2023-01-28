const assert = require("assert")
const ganache = require("ganache-cli")
const { beforeEach } = require("mocha");
const Web3 = require("web3")
const web3 = new Web3(ganache.provider())

const compiledFactory = require("../ethereum/build/PromoDataFactory.json");
const compiledPromoData = require("../ethereum/build/PromoData.json");

let accounts
let factory
let promoData
let description = 'test'
let estimatedValue = 10000000

beforeEach(async () => {
    accounts = await web3.eth.getAccounts()
    const balance = await web3.eth.getBalance(accounts[0])
    factory = await new web3.eth.Contract(compiledFactory.abi)
        .deploy({ data: compiledFactory.evm.bytecode.object })
        .send({ 
            from: accounts[0], 
            gas: '5000000'
        });
    await factory.methods.createPromoData(
        description, estimatedValue, accounts[1]
    ).send({
        from: accounts[0], 
        gas: '2000000'
    })
    const [ promoDataStruct ] = await factory.methods.getPromoDataStructList().call()
    promoData = await new web3.eth.Contract(compiledPromoData.abi, promoDataStruct.promoDataAddress)
})

describe('Promo Data', async() => {

    it('create new a promo data via factory', async() => {
        await factory.methods.createPromoData('test1', estimatedValue, accounts[1]).send({
            from: accounts[0], 
            gas: '2000000'
        })
        const promoDataStructList = await factory.methods.getPromoDataStructList().call()
        assert.equal(promoDataStructList.length, 2)
    })

    it('check summary', async() => {
        const summary = await promoData.methods.getSummary().call()
        assert.equal(summary[0], description)
        assert.equal(summary[1], accounts[0])
        assert.equal(summary[2], accounts[1])
        assert.equal(summary[3], estimatedValue)
        assert.equal(summary[4], 0) // no promo data added
        assert.equal(summary[5], false)
        assert.equal(summary[6], 0)
    })

    it('can save promo data successfully', async() => {
        const promoDescList = ['a', 'b', 'c']
        const promoParsedResultList = ['aa', 'bb', 'cc']

        await promoData.methods.saveData(promoDescList, promoParsedResultList).send({
            from: accounts[0], 
            gas: '2000000', 
            value: web3.utils.toWei('1', 'ether')
        })

        const summary = await promoData.methods.getSummary().call()
        assert.equal(summary[4], promoDescList.length)
        assert.equal(summary[5], true) // complete
        assert.equal(summary[6], web3.utils.toWei('1', 'ether'))

        const promoList = await promoData.methods.getPromoData().call()
        assert.equal(promoList.length, promoDescList.length)
    })

    it('can transfer successfully', async() => {
        const promoDescList = ['a', 'b', 'c']
        const promoParsedResultList = ['aa', 'bb', 'cc']

        await promoData.methods.saveData(promoDescList, promoParsedResultList).send({
            from: accounts[0], 
            gas: '2000000', 
            value: web3.utils.toWei('1', 'ether')
        })
        let balanceBefore = await web3.eth.getBalance(accounts[1])
        balanceBefore = parseInt(balanceBefore)
        await promoData.methods.transferValue().send({
            from: accounts[1], // receiver
            gas: '2000000'
        })
        let balanceAfter = await web3.eth.getBalance(accounts[1])
        balanceAfter = parseInt(balanceAfter)
        const balanceAfterEstimate = (balanceBefore + parseInt(web3.utils.toWei('1', 'ether'))) * 0.8 // consider cost for gas
        assert((balanceAfter - balanceAfterEstimate) > 0 )
    })
})