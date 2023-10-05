// NetworkContext.tsx
import React, { createContext, useContext, useState } from 'react';

type NetworkContextType = {
    network: "mainnet" | "devnet";
    setNetwork: React.Dispatch<React.SetStateAction<"mainnet" | "devnet">>;
};

const NetworkContext = createContext<NetworkContextType | undefined>(undefined);

export const NetworkProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [network, setNetwork] = useState<"mainnet" | "devnet">("mainnet");

    return (
        <NetworkContext.Provider value={{ network, setNetwork }}>
            {children}
        </NetworkContext.Provider>
    );
};

export const useNetwork = () => {
    const context = useContext(NetworkContext);
    if (context === undefined) {
        throw new Error('useNetwork must be used within a NetworkProvider');
    }
    return context;
};
