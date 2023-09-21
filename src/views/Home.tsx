import { useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useNavigate } from 'react-router-dom'; // <-- Use useNavigate instead of useHistory
import { Wallet } from "../components/Wallet";

function Home() {
    const { publicKey } = useWallet();
    const navigate = useNavigate(); // <-- Get the navigate function

    // Redirect to /create when the wallet is connected
    useEffect(() => {
        if (publicKey) {
            navigate('/create');
        }
    }, [publicKey, navigate]);
    return (
        <>
            <div className="my-12"> 
                <h1 className="text-4xl text-center font-semibold"> Mint compressed NFTs</h1>
                <p className="text-center w-4/12 flex m-auto my-4 font-light">From event ticketing to social media stickers, compressed NFTs open up a whole new world of possibilities.</p>
                <div className="p-3 w-72 my-6 m-auto justify-center flex rounded-2xl text-center font-bold"> 
                    <Wallet />
                </div>
            </div>
            <div className="mx-20 mt-20"> 
                <h2 className="text-orange-500 text-xl font-bold"> What are compressed NFTs? </h2>
                <p className="text-gray-200 font-light w-8/12 text-left">NFT compression allows developers to mint large amounts of NFTs for a fraction of the cost. This is achieved by storing the NFT properties on the Solana ledger instead of accounts. Traditionally, developers would need to allocate an account for each NFT in a collection.</p>
            </div>
        </>
    );
}

export default Home;
