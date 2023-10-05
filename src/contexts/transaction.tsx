// contexts/TransactionContext.tsx

import { createContext, useContext, ReactNode, useState } from 'react';

interface TransactionContextType {
    txn: string | null;
    setTxn: React.Dispatch<React.SetStateAction<string | null>>;
}

const TransactionContext = createContext<TransactionContextType | undefined>(undefined);

export const useTransaction = () => {
    const context = useContext(TransactionContext);
    if (!context) {
        throw new Error('useTransaction must be used within a TransactionProvider');
    }
    return context;
};

export const TransactionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [txn, setTxn] = useState<string | null>(null);

    return (
        <TransactionContext.Provider value={{ txn, setTxn }}>
            {children}
        </TransactionContext.Provider>
    );
};
