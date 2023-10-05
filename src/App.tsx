import { useMemo } from "react";
import "./index.css";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import Navbar from "./components/Navbar";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { MintView } from "./views/MintView";
import CollectionCards from "./components/CollectionCard";
import Home from "./views/Home";
import Header from "./components/Header";
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
} from "@solana/wallet-adapter-wallets";
import { Connection } from "@solana/web3.js";
import ToggleForm from "./components/forms/Forms";
import MintToCollection from "./components/forms/MintCollection";
import { TransactionProvider } from "./contexts/transaction";
import { NetworkProvider, useNetwork } from './contexts/rpc';
import { useEffect } from 'react';


function MainApp() {
  const { network } = useNetwork();

  // Construct the endpoint URL based on the current network state
  const baseURL = network === "mainnet" 
    ? process.env.REACT_APP_MAINNET_API_URL 
    : process.env.REACT_APP_DEVNET_API_URL;
  const apiKey = process.env.REACT_APP_API_KEY;
  const endpoint = `${baseURL}${apiKey}`;

  const connection = useMemo(() => new Connection(endpoint), [endpoint]);
  useEffect(() => {
  }, [network]);
  const wallets = useMemo(
    () => [new PhantomWalletAdapter(), new SolflareWalletAdapter()],
    [connection] // Updated the dependency array
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <TransactionProvider>
        <div className="bg-black text-white w-100">
            <Navbar />
          </div>
          <div className="bg-black text-white min-h-screen overflow-hidden overflow-x-hidden overflow-y-hidden">
            <Header imageUrl="/kitchen.png" />
            <Router>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/create" element={<CollectionCards />} />
              <Route path="/collection-mint" element={<ToggleForm />} />
              <Route path="/mint-cnft" element={<MintView />} />
              <Route path="/mint-cnft-collection" element={<MintToCollection />} />
            </Routes>
            </Router>

          </div>
        </TransactionProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}

function App() {
  return (
    <NetworkProvider>
      <MainApp />
    </NetworkProvider>
  );
}

export default App;





