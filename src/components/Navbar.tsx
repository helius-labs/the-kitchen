// Navbar.tsx
import React from "react";
import { Tooltip } from "flowbite-react";
import { useNetwork } from "../contexts/rpc";

const Navbar: React.FC = () => {
  const { network, setNetwork } = useNetwork();

  const isMainnet = network === "mainnet";
  const toggleNetwork = () => {
    const newNetwork = isMainnet ? "devnet" : "mainnet";
    setNetwork(newNetwork);
  };

  return (
    <div className="flex justify-between items-center py-1 px-2 bg-black text-white overflow-x-hidden">
      {" "}
      {/* Added overflow-x-hidden */}
      <a href="/">
        <img
          className="w-24 sm:w-1/6 max-w-full"
          src="helius.png"
          alt="Helius Logo"
        />
      </a>
      <div className="flex items-center space-x-2">
        {" "}
        {/* Reduced spacing to space-x-2 */}
        <div className="flex items-center space-x-2">
          <span className="text-white font-bold">
            {isMainnet ? "Mainnet" : "Devnet"}
          </span>

          <div className="relative inline-block w-10 align-middle select-none">
            <input
              type="checkbox"
              checked={isMainnet}
              onChange={toggleNetwork}
              className="hidden"
              id="toggleNetwork"
            />
            <label
              htmlFor="toggleNetwork"
              className="block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer w-10"
            >
              <span
                className={`absolute left-0.5 top-0.5 w-5 h-5 rounded-full bg-white transition-transform duration-300 ${
                  isMainnet ? "translate-x-5" : "translate-x-0"
                }`}
              >
                {isMainnet && (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    className="w-4 h-4 bg-[#E84125] p-0.5 rounded-full"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </span>
            </label>
          </div>
        </div>
        <Tooltip content="What is Compression?">
    <a href="https://www.helius.dev/blog/all-you-need-to-know-about-compression-on-solana" target="_blank" rel="noopener noreferrer">
      <img className="h-10 w-10" src="question.svg" alt="What is Compression?" />
    </a>
  </Tooltip>
        <Tooltip content="Docs">
          <a href="https://github.com/helius-labs/the-kitchen">
            <img className="h-10 w-10" src="docs.svg" alt="Docs" />
          </a>
        </Tooltip>
        <Tooltip content="Github Repository">
          <a href="https://docs.helius.dev/welcome/what-is-helius">
            <img
              className="h-10 w-10"
              src="github.svg"
              alt="Github Repository"
            />
          </a>
        </Tooltip>
      </div>
    </div>
  );
};

export default Navbar;
