import web3 from "./web3"
import Factory from './build/PromoDataFactory.json'

// const address = '0x0A6ffBeDbFA5690F5EF3256A281793D979Edf4bb'
const address = '0x6eb3229d5466710929701fFB7C3dFeA45D1719C1'
const instance = new web3.eth.Contract(Factory.abi, address)

export default instance