// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

contract L1_to_ZK 
{
    event tokenStaked(address NFTAddr, uint tokenID, uint serialID);
    event tokenUnstaked(address NFTAddr, uint tokenID, uint serialID);

    mapping(uint32 => stakedNFT) public serialid_to_nft;

    struct stakedNFT {
        address _userAdd;
        address _NFTaddr;
        uint _tokenID;
        uint _serialID;
    }

    function bridgeToZK(address NFTAddress, uint tokenID, uint32 serialId) external
    {
        IERC721(NFTAddress).safeTransferFrom(msg.sender, address(this), tokenID);
        serialid_to_nft[serialId] = stakedNFT(msg.sender, NFTAddress, tokenID, serialId);
        emit tokenStaked(NFTAddress, tokenID, serialId);
    }

    // This function must be named mintNFTFromZksync to match the Zksync factory specificiation
    // No minting occurs here however. Only a withdraw of a staked NFT occurs
    function mintNFTFromZkSync(
        address creator,
        address recipient,
        uint32 creatorAccountId,
        uint32 serialId,
        bytes32 contentHash,
        uint256 tokenId
    ) external
    {
        stakedNFT memory nftInstance = serialid_to_nft[serialId];
        IERC721(nftInstance._NFTaddr).safeTransferFrom(address(this), nftInstance._userAdd, nftInstance._tokenID);
        
        // free up storage and delete the entry
        delete serialid_to_nft[serialId];

        emit tokenUnstaked(nftInstance._NFTaddr, nftInstance._tokenID, nftInstance._serialID);
    }
}
