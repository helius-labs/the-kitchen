import {  useMemo } from "react";
import './index.css';
import {
    ConnectionProvider,
    WalletProvider,
  } from "@solana/wallet-adapter-react";
import Navbar from './components/Navbar';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { CollectionView } from "./views/CollectionView";
import { MintView } from "./views/MintView";
import CollectionCards from './components/CollectionCard';
import Home from './views/Home';
import Header from './components/Header';
import {
    PhantomWalletAdapter,
    SolflareWalletAdapter,
  } from "@solana/wallet-adapter-wallets";
  import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
  import { clusterApiUrl } from "@solana/web3.js";

function App() {
  const network = WalletAdapterNetwork.Devnet;

  // You can also provide a custom RPC endpoint.
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);

  const wallets = useMemo(
    () => [

      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [network]
  );
  return (
    <ConnectionProvider endpoint={endpoint}>
    <WalletProvider wallets={wallets} autoConnect>
      <Router>
          <div className="bg-black text-white min-h-screen">
              <Navbar />
              <Header imageUrl='/kitchen.png' />
              <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/create" element={
                          <CollectionCards />
                  } />
                  <Route path="/create-collection" element={<CollectionView />} />
                  <Route path="/mint-cnft" element={<MintView />} />
              </Routes>
          </div>
      </Router>
      </WalletProvider>
    </ConnectionProvider>
  );
}


export default App;
