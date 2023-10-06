import React from "react";
import DefaultModal from "./Modal";
import { Wallet } from "./Wallet";

const Navbar: React.FC = () => {
  return (
    <div className="flex justify-between items-center py-1 px-2 bg-black text-white">
      <a href="/">
        <img
          className="w-32 sm:w-40 md:w-40 lg:w-48 max-w-full"
          src="helius.png"
          alt="Helius Logo"
        />
      </a>
      <div className="flex items-center space-x-2 p-2">
        <Wallet/>
        <DefaultModal/>

      </div>
    </div>
  );
};

export default Navbar;
