// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

contract ZigZagZksyncNFTFactory 
{
    event tokenStaked(address NFTAddr, uint l1TokenId, uint zksyncTokenId);
    event tokenUnstaked(address NFTAddr, uint l1TokenId, uint zksyncTokenId);

    // key is zksync token ID
    mapping(uint => stakedNFT) public zksyncNFTs;

    struct stakedNFT {
        address _userAdd;
        address _NFTaddr;
        uint _l1TokenId;
        uint32 _zksyncTokenId;
    }

    function bridgeToZK(address NFTAddress, uint l1TokenId, uint32 zksyncTokenId) external
    {
        IERC721(NFTAddress).safeTransferFrom(msg.sender, address(this), l1TokenId);
        zksyncNFTs[zksyncTokenId] = stakedNFT(msg.sender, NFTAddress, l1TokenId, zksyncTokenId);
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
        stakedNFT memory nftInstance = zksyncNFTs[serialId];
        IERC721(nftInstance._NFTaddr).safeTransferFrom(address(this), nftInstance._userAdd, nftInstance._l1TokenId);
        
        // free up storage and delete the entry
        delete zksyncNFTs[tokenId];

        emit tokenUnstaked(nftInstance._NFTaddr, nftInstance._l1TokenId, nftInstance._zksyncTokenId);
    }

    function getNftByZksyncId(uint32 zksyncTokenId) external view returns (stakedNFT memory) {
        return zksyncNFTs[zksyncTokenId];
    }
}
