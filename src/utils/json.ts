type AttributeType = {
    name: string;
    value: string;
  };
type CreatorType = {
    address: string;
    share: number;
  };
  
export const generateJSONData = (file: File, imageUri: string, collectionName: string, description: string, externalUrl: string, attributes: AttributeType[], creators: CreatorType[], collectionSymbol: string, royalties: number, defaultPublicKey: string ) => {
    const defaultCreators = [
        {
          address: defaultPublicKey,
          share: 100,
        },
      ];
    let jsonData = {
        name: collectionName,
        description: description,
        symbol: collectionSymbol,
        image: imageUri,  
        external_url: externalUrl ? externalUrl : "",
        seller_fee_basis_points: royalties,
        attributes: attributes && attributes[0].name ? attributes.map(attr => ({ trait_type: attr.name, value: attr.value })) : [],
        properties: {
            files: [
                {
                    uri: imageUri,
                    type: file.type
                },
            ],
            category: "image",
            creators: creators && creators[0].address ? creators.map(creator => ({ address: creator.address, share: Number(creator.share) })) : defaultCreators,
        }
    };

    // Remove keys with undefined values
    Object.keys(jsonData).forEach(key => (jsonData as any)[key] === undefined && delete (jsonData as any)[key]);

    return jsonData;
};