import web3 from "./web3"
import promoData from './build/PromoData.json'

const PromoData = async (address) => {
    const instance = new web3.eth.Contract(promoData.abi, address)
    return instance
}

export default PromoData