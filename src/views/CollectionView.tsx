import CollectionForm from "../components/forms/CollectionForm";
import { useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useNavigate } from "react-router-dom";
export function CollectionView() {
    const navigate = useNavigate();
    const { connected } = useWallet();
    
    useEffect(() => {
        if (!connected) {
            navigate('/')
        }
      }, [connected, navigate])
    return <div>
        <CollectionForm />
    </div>;
  }