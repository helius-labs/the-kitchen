import { Wallet } from "../components/Wallet";
import { useWallet } from "@solana/wallet-adapter-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
function Home() {
  const { wallet, publicKey } = useWallet();
  const [connected, setConnected] = useState(false);
  useEffect(() => {
    if (wallet?.adapter.connected) {
      setConnected(true);
    }
  }, [wallet?.adapter.connected]);

  let navigate = useNavigate();

  return (
    <>
      <div className="my-12 scrollbar-thin">
        <h1 className="text-4xl text-center font-semibold">
          {" "}
          Mint Compressed NFTs{" "}
        </h1>
        <p className="text-center justify-center w-full sm:w-4/12 px-4 sm:px-0 flex m-auto my-4 font-light">
          Only Possible on Solana.
        </p>
        <div className="p-3 w-72 my-6 m-auto justify-center flex rounded-2xl text-center font-bold">
          {!wallet?.adapter.connected && (
            <h3 className="text-lg font-bold">Connect your wallet to start cooking!</h3>
          )}
          {wallet?.adapter.connected && (
            <>
              <button
                className="bg-[#E84125] px-4 py-2 text-lg rounded-lg text-white font-bold w-full 
                             hover:bg-orange-600 active:scale-95 transform transition-transform duration-150"
                onClick={() => navigate("/create")}
              >
                Let me cook
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
}

export default Home;
