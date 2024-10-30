// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract PropertyLedger {
    address public owner;
    uint256 public propertyCount;
    uint256 public fee = 5; // per thousand

    constructor() {
        owner = msg.sender;
    }

    struct Property {
        address owner;
        uint256[] saleListingIds;
        uint256[] rentalContractIds;
    }

    mapping(uint256 => Property) public properties;

    struct SaleListing {
        uint8 status; // 0: canceled, 1: active, 2: sold
        uint256 propertyId;
        uint256 price;
        uint256 listingDate;
        uint256 soldDate;
        address buyer;
    }

    SaleListing[] public saleListings;

    struct RentalContract {
        uint8 status; // 0: canceled, 1: active, 2: rented, 3: completed
        uint256 propertyId;
        uint256 price;
        uint256 listingDate;
        uint256 startDate;
        uint256 contractDuration;
        uint256 paymentCount;
        address tenant;
        uint8 cancellationApprovals;
    }

    RentalContract[] public rentalContracts;

    
    event PropertyRegistered();
    event FeeChanged();


    modifier isAddressZero (address _address) {
        require(_address != address(0), "Invalid address: Address cannot be zero.");
        _;
    }

    modifier isPropertyIdValid (uint256 _propertyId) {
        require(_propertyId <= propertyCount, "Property ID doesn't exist.");
        _;
    }

    modifier onlyOwner () {
        require(msg.sender == owner, "Only the contract owner can call this function.");
        _;
    }

    modifier onlyPropertyOwner (uint256 _propertyId) {
        require(properties[_propertyId].owner == msg.sender, "You are not the owner of the property.");
        _;
    }

    modifier isPriceGreaterThanZero (uint256 _price) {
        require(_price > 0, "Price must be greater than zero.");
        _;
    }


    function getSaleListingsLength() external view returns (uint256) {
        return saleListings.length;
    }

    function getRentalContractsLength() external view returns (uint256) {
        return rentalContracts.length;
    }
    
    function _getLastSaleListingIdOfProperty (uint256 _propertyId) internal view returns(uint256) {
        uint256 saleListingIdsLength = properties[_propertyId].saleListingIds.length;
        require(saleListingIdsLength > 0, "No sale listing found for this property.");
        return properties[_propertyId].saleListingIds[saleListingIdsLength - 1];
    }

    function getSaleListingIdsLengthOfProperty (uint256 _propertyId) public view isPropertyIdValid(_propertyId) returns(uint256) {
        return properties[_propertyId].saleListingIds.length;
    }

    function getRentalContractIdsLengthOfProperty (uint256 _propertyId) public view isPropertyIdValid(_propertyId) returns(uint256) {
        return properties[_propertyId].rentalContractIds.length;
    }

    function getSaleListingIdsOfProperty (uint256 _propertyId) public view isPropertyIdValid(_propertyId) returns(uint256[] memory) {
        return properties[_propertyId].saleListingIds;
    }

    function getRentalContractIdsOfProperty (uint256 _propertyId) public view isPropertyIdValid(_propertyId) returns(uint256[] memory) {
        return properties[_propertyId].rentalContractIds;
    }

    function getLastSaleListingOfProperty (uint256 _propertyId) external view isPropertyIdValid(_propertyId) returns(SaleListing memory){
        uint256[] memory saleListingIds = properties[_propertyId].saleListingIds;
        require(saleListingIds.length > 0, "No sale listing found for this property");

        return saleListings[saleListingIds[saleListingIds.length - 1]];
    }

    function getLastRentalContractOfProperty (uint256 _propertyId) external view isPropertyIdValid(_propertyId) returns(RentalContract memory){
        uint256[] memory rentalContractIds = properties[_propertyId].rentalContractIds;
        require(rentalContractIds.length > 0, "No rental contract found for this property");

        return rentalContracts[rentalContractIds[rentalContractIds.length - 1]];
    }

    function registerProperty(address _propertyOwner) public onlyOwner() isAddressZero(_propertyOwner) {
        properties[propertyCount] = Property({
            owner: _propertyOwner,
            rentalContractIds: new uint256[](0),
            saleListingIds: new uint256[](0)
        });
        propertyCount++;
        emit PropertyRegistered();
    }

    function changeFee (uint256 _fee) public onlyOwner() {
        fee = _fee;
        emit FeeChanged();
    }

    function withdrawEther(address payable _to, uint256 _amount) public onlyOwner() {
        require(address(this).balance >= _amount, "Insufficient contract balance");

        (bool success, ) = _to.call{value: _amount}("");
        require(success, "Failed to withdraw Ether");
    }

    function paymentHandler (address _receiver, uint256 amount) internal {
        uint256 _fee = (amount * fee) / 1000;
        uint256 amountToSeller = msg.value - _fee;

        (bool feeSent, ) = address(this).call{value: _fee}("");
        require(feeSent, "Failed to transfer fee to the contract.");

        (bool paymentSent, ) = _receiver.call{value: amountToSeller}("");
        require(paymentSent, "Failed to transfer payment to the seller.");
    }
    
    function transferPropertyOwnership (uint256 _propertyId, address _newOwner) public isPropertyIdValid(_propertyId) onlyPropertyOwner(_propertyId) isAddressZero(_newOwner) {
        properties[_propertyId].owner = _newOwner;
    }

    // Sale Listing Operations

    function createSaleListing (uint256 _propertyId, uint256 _price, address _buyer) public isPropertyIdValid(_propertyId) onlyPropertyOwner(_propertyId) isAddressZero(_buyer) isPriceGreaterThanZero(_price) {
        require(msg.sender != _buyer, "The buyer address cannot be the same as the sender address.");
        if(properties[_propertyId].saleListingIds.length != 0) {
            require(saleListings[_getLastSaleListingIdOfProperty(_propertyId)].status == 2, "You cannot create a sale listing because the property already has an active or canceled sale listing.");
        }
        
        saleListings.push(SaleListing({
            status: 1,
            propertyId:_propertyId,
            price: _price,
            listingDate: block.timestamp,
            soldDate: 0,
            buyer: _buyer
        }));

        properties[_propertyId].saleListingIds.push(saleListings.length - 1);
    }

    function updateSaleListing (uint256 _propertyId, uint256 _price, address _buyer) public isPropertyIdValid(_propertyId) onlyPropertyOwner(_propertyId) isAddressZero(_buyer) isPriceGreaterThanZero(_price) {
        SaleListing storage _saleListing = saleListings[_getLastSaleListingIdOfProperty(_propertyId)];

        require(_saleListing.status != 2, "You can only update your sale listing if its status is not sold.");

        if(_saleListing.status != 1) _saleListing.status = 1;
        if(_saleListing.price != _price) _saleListing.price = _price;
        _saleListing.listingDate = block.timestamp;
        if(_saleListing.buyer != _buyer) _saleListing.buyer = _buyer;
    }

    function cancelSaleListing (uint256 _propertyId) public isPropertyIdValid(_propertyId) onlyPropertyOwner(_propertyId) {
        SaleListing storage _saleListing = saleListings[_getLastSaleListingIdOfProperty(_propertyId)];

        require(_saleListing.status == 1, "Sale Listing cannot be canceled as it is already either sold or canceled.");

        _saleListing.status = 0;
    }

    function purchaseProperty (uint256 _propertyId) payable public isPropertyIdValid(_propertyId) {
        SaleListing storage _saleListing = saleListings[_getLastSaleListingIdOfProperty(_propertyId)];

        require(_saleListing.status == 1, "Property is not for sale.");
        require(msg.sender == _saleListing.buyer,  "You are not the designated buyer of this sale listing.");
        require(_saleListing.price == msg.value, "Incorrect amount.");

        paymentHandler(properties[_propertyId].owner, msg.value);

        properties[_propertyId].owner = msg.sender;
        _saleListing.status = 2;
        _saleListing.soldDate = block.timestamp;
    }

    // Rental Contract Operations

    function createRentalContract (uint256 _propertyId, uint256 _price, uint256 _contractDuration, address _tenant) public 
        isPropertyIdValid(_propertyId) onlyPropertyOwner(_propertyId) isAddressZero(_tenant) isPriceGreaterThanZero(_price) {
        require(_contractDuration > 0, "Contract duration must be greater than zero.");

        uint256 _rentalContractIdsLengthOfProperty = getRentalContractIdsLengthOfProperty(_propertyId);
        if(_rentalContractIdsLengthOfProperty > 0) {
            RentalContract memory _rentalContract = rentalContracts[properties[_propertyId].rentalContractIds[_rentalContractIdsLengthOfProperty - 1]];
            require(_rentalContract.status == 3 || (_rentalContract.status == 0 && _rentalContract.paymentCount > 0), 
                "You cannot create a new rental contract. There is already an active or canceled rental contract for this property.");
        }

        rentalContracts.push(RentalContract({
            status: 1,
            propertyId: _propertyId,
            price: _price,
            listingDate: block.timestamp,
            startDate: 0,
            contractDuration: _contractDuration,
            paymentCount: 0,
            tenant: _tenant,
            cancellationApprovals: 0
        }));

        properties[_propertyId].rentalContractIds.push(rentalContracts.length -1);
    }

    function updateRentalContract (uint256 _rentalContractId, uint256 _price, uint256 _contractDuration, address _tenant) public isAddressZero(_tenant) isPriceGreaterThanZero(_price) {
        require(_rentalContractId < rentalContracts.length, "Rental contract id doesn't exist.");
        require(_contractDuration > 0, "Contract duration must be greater than zero.");
        RentalContract storage _rentalContract = rentalContracts[_rentalContractId];
        require(_rentalContract.status < 2, "Rental contract cannot be updated as it is already either rented or expired.");

        if(_rentalContract.status != 1) _rentalContract.status = 1;
        if(_rentalContract.price != _price) _rentalContract.price = _price;
        _rentalContract.listingDate = block.timestamp;
        if(_rentalContract.startDate != 0) _rentalContract.startDate = 0;
        if(_rentalContract.contractDuration != _contractDuration) _rentalContract.contractDuration = _contractDuration;
        if(_rentalContract.tenant != _tenant) _rentalContract.tenant = _tenant;
    }

    function cancelRentalContract (uint256 _rentalContractId) public {
        require(_rentalContractId < rentalContracts.length, "Rental contract ID doesn't exist.");
        RentalContract storage _rentalContract = rentalContracts[_rentalContractId];

        if (_rentalContract.status == 1) {
            require(msg.sender == properties[_rentalContract.propertyId].owner, "Only the property owner can call this function.");
            _rentalContract.status = 0;
        }
        else if (_rentalContract.status == 2) {
            bool isPropertyOwner = msg.sender == properties[_rentalContract.propertyId].owner;
            bool isTenant = msg.sender == _rentalContract.tenant;

            require(isPropertyOwner || isTenant, "Caller is not the property owner or tenant of the property.");

            if(isPropertyOwner){
                if(_rentalContract.cancellationApprovals < 2)_rentalContract.cancellationApprovals += 2;
                else revert("You have already gave approval for rental contract cancellation.");
            }
            else {
                if (_rentalContract.cancellationApprovals == 0 || _rentalContract.cancellationApprovals == 2) _rentalContract.cancellationApprovals += 1;
                else revert("You have already gave approval for rental contract cancellation.");
            }
            
            if(_rentalContract.cancellationApprovals == 3) _rentalContract.status = 0;
        }
        else revert("Rental contract cannot be canceled as it is already either canceled or completed.");
    }
    
    function confirmRentalContract (uint256 _rentalContractId) public {
        require(_rentalContractId < rentalContracts.length, "Rental contract ID doesn't exist.");

        RentalContract storage _rentalContract = rentalContracts[_rentalContractId];

        require(_rentalContract.tenant == msg.sender, "You are not the designated tenant of the rental contract.");
        require(_rentalContract.status == 1, "Rental contract status must be active to confirm.");

        _rentalContract.status = 2;
        _rentalContract.startDate = block.timestamp;
    }

    function payRent (uint256 _rentalContractId) public payable {
        require(_rentalContractId <= rentalContracts.length - 1, "Invalid rental contract id.");

        RentalContract storage _rentalContract = rentalContracts[_rentalContractId];
        
        require(_rentalContract.tenant == msg.sender, "You are not designated the tenant for this rental contract.");
        require(_rentalContract.status == 2, "The rental contract status must be 'rented' to proceed with payment.");
        require(_rentalContract.price == msg.value, "Incorrect amount.");
        
        paymentHandler(properties[_rentalContract.propertyId].owner, msg.value);
        _rentalContract.paymentCount++;

        if(_rentalContract.paymentCount == _rentalContract.contractDuration) _rentalContract.status = 3;
    }

    receive() external payable {}
}