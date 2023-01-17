// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

interface IERC721 {
    function transferFrom(
        address _from,
        address _to,
        uint256 _id
    ) external;
}

contract Escrow {
    address public nftAddress;
    uint256 public nftID;
    uint256 public purchasePrice;
    uint256 public escrowAmount;
    address payable public seller;
    address payable public buyer;
    address public inspector;
    address public lender;
    bool public inspectionPass = false;

    mapping(address => bool) public approval;

    modifier onlyBuyer() {
        require(msg.sender == buyer, "only buyer can call this funcation");
        _;
    }

    modifier onlyInspector() {
        require(
            msg.sender == inspector,
            "only inspector can call this funcation"
        );
        _;
    }

    receive() external payable {}

    constructor(
        address _nftAddress,
        uint256 _nftID,
        uint256 _purchasePrice,
        uint256 _escrowAmount,
        address payable _seller,
        address payable _buyer,
        address _inspector,
        address _lender
    ) {
        nftAddress = _nftAddress;
        nftID = _nftID;
        seller = _seller;
        buyer = _buyer;
        purchasePrice = _purchasePrice;
        escrowAmount = _escrowAmount;
        inspector = _inspector;
        lender = _lender;
    }

    // Put Under Contract (only buyer - payable escrow)
    function depositEarnest() public payable onlyBuyer {
        require(msg.value >= escrowAmount);
    }

    function updateInspectionStatus(bool _passed) public onlyInspector {
        inspectionPass = _passed;
    }

    function approvalSale() public {
        approval[msg.sender] = true;
    }

    function finalizeSale() public {
        // check inspector
        require(inspectionPass, "must pass inspection");
        require(approval[buyer], "must be approval buyer");
        require(approval[seller], "must be approval seller");
        require(approval[lender], "must be approval lender");
        require(
            address(this).balance >= purchasePrice,
            "must have ether funds"
        );

        (bool success, ) = payable(seller).call{value: address(this).balance}(
            ""
        );
        require(success);

        // transfer ownership of property
        IERC721(nftAddress).transferFrom(seller, buyer, nftID);
    }

    function getBalance() public view returns (uint256) {
        return address(this).balance;
    }
}
