import { Card } from "flowbite-react";
import { useNavigate } from "react-router-dom";
import { useWallet } from "@solana/wallet-adapter-react";

interface CollectionCardProps {
  title: string;
  description: string;
  image: string;
  route: string;
  button_text: string;
}
export default function CollectionCards() {
  const { wallet } = useWallet();

  return (
    <>
      {wallet?.adapter.connected 
      ? 
        <div className="flex flex-col md:flex-row justify-center items-start md:items-center w-full md:space-x-4 mt-16 md:mt-20 lg:mt-24 scrollbar-thin">
          <CollectionCard
            title="Create Collection"
            description="Mint cNFTs to a new or existing collection."
            image="collection.svg"
            route="/collection-mint"
            button_text="Create"
          />
          <CollectionCard
            title="Mint cNFTs"
            description="Mint cNFTs without a collection."
            image="art.svg"
            route="/mint-cnft"
            button_text="Mint"
          />
        </div>
      : 
        <div className="flex flex-col md:flex-row justify-center items-start md:items-center w-full md:space-x-4 mt-16 md:mt-20 lg:mt-24">
          Please connect your wallet to create a collection or to mint cNFTs!
        </div>
      }
    </>
  );
}

function CollectionCard({
  title,
  description,
  image,
  route,
  button_text,
}: CollectionCardProps) {
  let navigate = useNavigate();

  return (
    <Card className="w-full md:max-w-sm md:w-2/5 bg-black border-2 border-opacity-50 hover:border-opacity-100 my-2">
      <img className="w-1/6 mt-[-10px]" src={image} alt="" />
      <h5 className="text-2xl font-bold tracking-tight text-white dark:text-white">
        {title}
      </h5>
      <p className="font-normal text-white dark:text-gray-400">{description}</p>
      <button
        className="bg-off-black border border-orange hover:bg-orange-transparent px-4 py-2 text-lg rounded-lg text-white font-bold w-full 
                             hover:bg-orange-600 active:scale-95 transform transition-transform duration-150"
        onClick={() => navigate(route)}
      >
        {button_text}
      </button>
    </Card>
  );
}
