pragma solidity ^0.5.0;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/Adoption.sol";

contract TestAdoption {
    Adoption adoption = Adoption(DeployedAddresses.Adoption());

    function testUserCanAdoptPet() public {
        uint256 returnedId = adoption.adopt(expectedPetId);

        Assert.equal(
            returnedId,
            expectedPetId,
            "Adoption of the expected pet should match what is returned."
        );
    }

    function testGetAdopterAddressByPetId() public {
        address adopter = adoption.adopters(expectedPetId);
        Assert.equal(
            adopter,
            expectedAdopter,
            "Owner of the expected pet should be this contract"
        );
    }

    function testGetAdopterAddressByPetIdInArray() public {
        // メモリー内のadopter変数に値を格納する
        address[16] memory adopters = adoption.getAdopters();

        Assert.equal(
            adopters[expectedPetId],
            expectedAdopter,
            "Owner of the expected pet should be this contract"
        );
    }

    uint256 expectedPetId = 8;
    address expectedAdopter = address(this);
}
