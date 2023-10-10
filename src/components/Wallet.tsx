import { FC } from "react";
import {
  WalletModalProvider,
  WalletMultiButton
} from "@solana/wallet-adapter-react-ui";
import "../index.css";

//require("@solana/wallet-adapter-react-ui/styles.css");

//const WalletMultiButtonDynamic = lazy(() => import('@solana/wallet-adapter-react-ui').then(module => ({ default: module.WalletMultiButton })));

export const Wallet: FC = () => {
  return (
    <WalletModalProvider>
        <WalletMultiButton />
    </WalletModalProvider>
  );
};
