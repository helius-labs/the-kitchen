import axios from 'axios';

const serverUrl = 'http://localhost:3001/mint';

export const mintCNFT = async (mintName: string, mintSymbol:string, owner:string, royalties:number, uri:string) => {
    try {
        const response = await axios.post(serverUrl, {
            mintName,
            mintSymbol,
            owner,
            royalties,
            uri
        });
        return response;
    } catch (error) {
        console.error("Error minting cNFT:", error);
    }
};