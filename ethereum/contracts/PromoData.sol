// SPDX-License-Identifier: MIT

pragma solidity ^0.8.17;


contract PromoDataFactory {

    struct PromoDataStruct {
        address promoDataAddress;
        string description;
        uint createTime;
    }
    mapping(address => uint) accountAddrToRequestCount;
    mapping(address => PromoDataStruct[]) accountAddrToPromoDataStructList;

    function createPromoData(string calldata _description, 
                             uint _estimatedValue, 
                             address payable _receiver
    ) public {
        address promoData = address(new PromoData(_description, _estimatedValue, msg.sender, _receiver));
        PromoDataStruct memory _promoDataStruct;
        _promoDataStruct.promoDataAddress = promoData;
        _promoDataStruct.description = _description;
        _promoDataStruct.createTime = block.timestamp;
        uint _id = accountAddrToRequestCount[msg.sender];
        PromoDataStruct[] storage senderRequests = accountAddrToPromoDataStructList[msg.sender];
        senderRequests.push(_promoDataStruct);
        accountAddrToRequestCount[msg.sender] = _id + 1;
    }

    function getPromoDataStructList() public view returns(PromoDataStruct[] memory) {
        return accountAddrToPromoDataStructList[msg.sender];
    }

    function getPromoDataRequestCount() public view returns(uint) {
        return accountAddrToRequestCount[msg.sender];
    }

    function getRecentlyCreatedPromoDataAddress() public view returns(address) {
        uint count = getPromoDataRequestCount();
        return accountAddrToPromoDataStructList[msg.sender][count-1].promoDataAddress;
    }
}


contract PromoData {

    struct Promo {
        string promoDesc;
        string promoParsedResult;
    }
    uint promoCount;
    Promo[] data;
    string description;
    address accountId;
    uint estimatedValue; // wei
    address payable receiver;
    bool complete = false; // only allow to call saveData once

    constructor (string memory _description, 
                 uint _estimatedValue, 
                 address _accountId, 
                 address payable _receiver // set when deploy factory
                ) {
        description = _description;
        accountId = _accountId;
        receiver = _receiver;
        estimatedValue = _estimatedValue;
    }

    function saveData(string[] memory promoDescList, 
                      string[] memory promoParsedResultList
                     ) public payable {
        require(promoDescList.length == promoParsedResultList.length);
        require(!complete);
        require(msg.value >= estimatedValue);
        
        for (uint i = 0; i < promoDescList.length; i++) {
            Promo memory promoData;
            promoData.promoDesc = promoDescList[i];
            promoData.promoParsedResult = promoParsedResultList[i];
            data.push(promoData);
        }
        promoCount = promoDescList.length;
        complete = true;
    }

    function saveDataAndTransferMoney(string[] memory promoDescList, 
                                      string[] memory promoParsedResultList
                                     ) public payable {
        saveData(promoDescList, promoParsedResultList);
        receiver.transfer(address(this).balance);
    }

    function transferValue() public {
        require(msg.sender == receiver);
        receiver.transfer(address(this).balance);
    }

    function getPromoDataByIndex(uint index) public view returns(Promo memory) {
        return data[index];
    }

    function getPromoData() public view returns(Promo[] memory) {
        return data;
    }

    function getSummary() public view returns(
        string memory, address, address, uint, uint, bool, uint
    ) {
        return (
            description, 
            accountId, 
            receiver, 
            estimatedValue, 
            promoCount, 
            complete, 
            address(this).balance
        );
    }

}
