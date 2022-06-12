// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

contract ZigZagZksyncNFTFactory 
{
    event tokenStaked(address NFTAddr, uint l1TokenId, uint zksyncTokenId);
    event tokenUnstaked(address NFTAddr, uint l1TokenId, uint zksyncTokenId);

    // key is zksync token ID
    mapping(uint => stakedNFT) public stakedNFTs;

    struct stakedNFT {
        address _userAdd;
        address _NFTaddr;
        uint _l1TokenId;
        uint _zksyncTokenId;
    }

    address private _zkSyncAddress;

    constructor( address zkSyncAddress) {
        _zkSyncAddress = zkSyncAddress;
    }

    function bridgeToZK(address NFTAddress, uint l1TokenId, uint zksyncTokenId) external
    {
        IERC721(NFTAddress).safeTransferFrom(msg.sender, address(this), l1TokenId);
        stakedNFTs[zksyncTokenId] = stakedNFT(msg.sender, NFTAddress, l1TokenId, zksyncTokenId);
        emit tokenStaked(NFTAddress, l1TokenId, zksyncTokenId);
    }

    // This function must be named mintNFTFromZksync to match the Zksync factory specificiation
    // No minting occurs here however. Only a withdraw of a staked NFT occurs
    function mintNFTFromZkSync(
        address creator,
        address recipient,
        uint32 creatorAccountId,
        uint32 serialId,
        bytes32 contentHash,
        uint256 tokenId // this is the zksync token ID
    ) external
    {
        // Withdrawing allowed only from zkSync
        require(msg.sender == _zkSyncAddress, "z"); 

        stakedNFT memory nftInstance = stakedNFTs[tokenId];
        IERC721(nftInstance._NFTaddr).safeTransferFrom(address(this), recipient, nftInstance._l1TokenId);
        
        // free up storage and delete the entry
        delete stakedNFTs[tokenId];

        emit tokenUnstaked(nftInstance._NFTaddr, nftInstance._l1TokenId, nftInstance._zksyncTokenId);
    }

    function getNftByZksyncId(uint zksyncTokenId) external view returns (stakedNFT memory) {
        return stakedNFTs[zksyncTokenId];
    }
}
