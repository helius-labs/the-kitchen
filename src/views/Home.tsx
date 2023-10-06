import { Wallet } from "../components/Wallet";
import { useWallet } from "@solana/wallet-adapter-react";
import { useState, useEffect } from "react";
function Home() {
    const { wallet, publicKey } = useWallet();
    const [connected, setConnected] = useState(false);
    useEffect(() => {
        if (wallet?.adapter.connected) {
            setConnected(true);
        }
    }, [wallet?.adapter.connected]);
   
    return (
        <>
            <div className="my-12 scrollbar-thin"> 
                <h1 className="text-4xl text-center font-semibold"> Mint Compressed NFTs </h1>
                <p className="text-center justify-center w-full sm:w-4/12 px-4 sm:px-0 flex m-auto my-4 font-light">
                Only Possible on Solana.
                </p>                
                <div className="p-3 w-72 my-6 m-auto justify-center flex rounded-2xl text-center font-bold"> 
                {!connected && (
                    <Wallet /> 
                    )} 
                    {connected && (
                        <>
                          <button className="bg-orange-600 p-4 rounded-2xl"> 
                        Let me cook
                        </button>
                        </>
                      

                    )}
                </div>
            </div>
        {/** 
         * <div className="mx-20 mt-20"> 
                <h2 className="text-orange-500 text-xl font-bold"> What are compressed NFTs? </h2>
                <p className="text-gray-200 font-light w-8/12 text-left">NFT compression allows developers to mint large amounts of NFTs for a fraction of the cost. This is achieved by storing the NFT properties on the Solana ledger instead of accounts. Traditionally, developers would need to allocate an account for each NFT in a collection.</p>
            </div>
         */}  
        </>
    );
}

export default Home;
