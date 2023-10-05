import axios from 'axios';

const serverUrl = 'http://localhost:3001/mint-to-collection';

export const mintCNFTCollection = async (mintName: string, mintSymbol:string, owner:string, royalties:number, uri:string, collection: string) => {
    try {
        const response = await axios.post(serverUrl, {
            mintName,
            mintSymbol,
            owner,
            royalties,
            uri,
            collection
        });
        return response;
    } catch (e: any) {
        throw new Error(e);
    }
};