"use client";

import { Modal, Tooltip } from "flowbite-react";
import { useState } from "react";
import { useNetwork } from "../contexts/rpc";

export default function DefaultModal() {
  const [openModal, setOpenModal] = useState<string | undefined>();
  const props = { openModal, setOpenModal };
  const { network, setNetwork } = useNetwork();

  const isMainnet = network === "mainnet";
  const toggleNetwork = () => {
    const newNetwork = isMainnet ? "devnet" : "mainnet";
    setNetwork(newNetwork);
  };
 
  
  return (
    <>
      <Tooltip content="Menu">
        <button onClick={() => props.setOpenModal("dismissible")}>
          <img
            className="h-8 w-8 sm:h-10 sm:w-10 md:h-8 md:w-12 lg:h-10 lg:w-10 p-1"
            src="hamburger.svg"
            alt="What is Compression?"
          />
        </button>
      </Tooltip>

      <Modal
        className="text-white rounded-lg"
        dismissible
        size={"sm"}
        show={props.openModal === "dismissible"}
        onClose={() => props.setOpenModal(undefined)}
      >
        <Modal.Header className="h-12 w-full p-2 text-center justify-center items-center bg-black"/>

        <Modal.Body className="bg-black">
          <div className="space-y-4">
            <a
              href="https://www.helius.dev/blog/all-you-need-to-know-about-compression-on-solana"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white text-lg font-bold text-center flex m-auto py-2 rounded-lg px-8 hover:bg-gray-700 justify-center"
            >
              What is Compression?
            </a>
            <a
              href="https://docs.helius.dev/compression-and-das-api/mint-api"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white text-lg font-bold text-center flex m-auto py-2 rounded-lg px-8 hover:bg-gray-700 justify-center"
            >
              Docs
            </a>
            <a
              href="https://github.com/helius-labs/the-kitchen"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white text-lg font-bold text-center flex m-auto py-2 rounded-lg px-8 hover:bg-gray-700 justify-center"
            >
              Github
            </a>
            <div className="flex items-center space-x-2 m-auto justify-center flex-col my-2">
              <span className="text-white font-bold">
                Network: {isMainnet ? "Mainnet" : "Devnet"}
              </span>
              <div className="relative inline-block w-12 align-middle select-none my-2">
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
                    className={`absolute left-0 top-0.5 w-5 h-5 rounded-full bg-white transition-transform duration-300 ${
                      isMainnet ? "translate-x-5" : "translate-x-0"
                    }`}
                  >
                    {isMainnet && (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        className="w-5 h-5 bg-orange p-0.5 rounded-full"
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
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
}
