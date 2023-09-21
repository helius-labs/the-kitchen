import { Card } from "flowbite-react";
import { useNavigate } from "react-router-dom";

interface CollectionCardProps {
  title: string;
  description: string;
  image: string;
  route: string;
  button_text: string;
}

export default function CollectionCards() {
  return (
    <div className="flex justify-center items-center min-h-screen space-x-4 mt-[-200px]">
      {" "}
      <CollectionCard
        title="Create Collection"
        description="Mint cNFTs to a collection."
        image="collection.svg"
        route="/create-collection"
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
  );
}

function CollectionCard({ title, description, image, route, button_text }: CollectionCardProps) {
    let navigate = useNavigate(); // Updated to useNavigate
  
    return (
      <Card className="max-w-sm w-2/5 bg-black border-2 border-opacity-50 hover:border-opacity-100">
        <img className='w-1/6 mt-[-10px]' src={image} alt='' />
        <h5 className="text-2xl font-bold tracking-tight text-white dark:text-white">
          {title}
        </h5>
        <p className="font-normal text-white dark:text-gray-400">{description}</p>
        <button
          className="bg-orange-500 p-2 rounded-lg font-bold"
          onClick={() => navigate(route)} // Updated to use navigate
        >
          {button_text}
        </button>
      </Card>
    );
  }
  


  
  
  
