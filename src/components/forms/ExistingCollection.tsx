import { useState, useRef, useEffect } from "react";
import { Label, Tooltip, Alert } from "flowbite-react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import {
  TransactionMessage,
  VersionedTransaction,
  PublicKey,
  SYSVAR_RENT_PUBKEY,
  SystemProgram,
} from "@solana/web3.js";
import {
  PROGRAM_ID as MPL_TOKEN_METADATA_PROGRAM_ID,
  createApproveCollectionAuthorityInstruction,
} from "@metaplex-foundation/mpl-token-metadata";
import {
  getCollectionAuthRecordPDA,
  getMetadataPDA,
} from "../../../src/utils/pdas";
import { useNavigate } from "react-router-dom";
import { useNetwork } from "../../../src/contexts/rpc";

export default function ExistingCollectionForm() {
  const [collectionName, setCollectionName] = useState("");
  const [revokeAuthority, setRevokeAuthority] = useState(false);
  const formRef = useRef<HTMLFormElement | null>(null);
  const { sendTransaction, publicKey } = useWallet();
  const { connection } = useConnection();
  const { network } = useNetwork();
  const [alert, setAlert] = useState<{
    type: "success" | "failure";
    message: JSX.Element;
  } | null>(null);
  const [txn, setTxn] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleMintCollectionNavigation = () => {
    navigate("/mint-cnft-collection", {
      state: { mint: collectionName, revoke: revokeAuthority },
    });
  };
  const approveAuthority = async () => {
    if (!publicKey) {
      return;
    }

    try {
      const collectionKey = new PublicKey(collectionName);
      let newAuthority = new PublicKey(
        "2LbAtCJSaHqTnP9M5QSjvAMXk79RNLusFspFN5Ew67TC"
      );
      let tokenMetadataPubkey = await getMetadataPDA(collectionKey);
      let collectionAuthorityPda = await getCollectionAuthRecordPDA(
        collectionKey,
        newAuthority
      );

      let instructions = [
        createApproveCollectionAuthorityInstruction(
          {
            collectionAuthorityRecord: collectionAuthorityPda,
            newCollectionAuthority: newAuthority,
            updateAuthority: publicKey,
            metadata: tokenMetadataPubkey,
            mint: collectionKey,
            payer: publicKey,
            rent: SYSVAR_RENT_PUBKEY,
            systemProgram: SystemProgram.programId,
          },
          MPL_TOKEN_METADATA_PROGRAM_ID
        ),
      ];
      let latestBlockhash = await connection.getLatestBlockhash();
      const message = new TransactionMessage({
        payerKey: publicKey,
        recentBlockhash: latestBlockhash.blockhash,
        instructions,
      }).compileToLegacyMessage();
      const transaction = new VersionedTransaction(message);
      const signature = transaction.sign([]);
      const txid = await sendTransaction(transaction, connection);
      const confirmedTransaction = await connection.confirmTransaction(
        txid,
        "confirmed"
      );
      if (!confirmedTransaction.value.err) {
        setAlert({
          type: "failure",
          message: (
            <>
              <p> Transaction failed. </p>
            </>
          ),
        });
      }
      setTxn(txid);
      setAlert({
        type: "success",
        message: (
          <>
            Collection was successfully imported!&nbsp;
            <a
              href={`https://xray.helius.xyz/tx/${txid}?network=${network}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              View Transaction
            </a>
          </>
        ),
      });
      return txid;
    } catch (error) {
      setAlert({
        type: "failure",
        message: (
          <>
            <p> Transaction failed. </p>
          </>
        ),
      });
    }
  };
  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    await approveAuthority();
  };

  useEffect(() => {
    formRef.current?.scrollIntoView({ behavior: "auto" });
  }, []);

  return (
    <>
      <h1 className="text-center font-bold text-2xl">
        Step 1: Import Existing Collection
      </h1>
      <div className="flex justify-center">
        {!txn && (
          <form
            onSubmit={handleSubmit}
            ref={formRef}
            className="flex flex-col gap-2 p-4 w-full max-w-xl lg:max-w-md pb-10 border rounded-lg mt-4 border-opacity-20 border-gray-200"
          >
            <div>
              <div className="mb-3 block">
                <Label
                  htmlFor="collectionId"
                  value="Collection ID (Public Key)"
                  className="text-white text-md font-bold"
                />
              </div>
              <input
                maxLength={100}
                onChange={(e) => setCollectionName(e.target.value)}
                type="text"
                id="collectionId"
                className="bg-black border h-8 border-gray-300 border-opacity-50 text-white text-sm rounded-lg hover:border-orange-600 focus:ring-orange-600 focus:border-orange-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-orange-500 dark:focus:border-orange-500"
                placeholder="e.g: 5jPTp1rQ2NjvUiu4R9YgpDAwHoSd4mr6TjQovxvqdjsN"
                value={collectionName}
                required
              />
            </div>
            <div className="flex items-center mt-4">
              <Label className="text-white flex items-center mr-4 text-md font-bold">
                <Tooltip content="When enabled, this will remove Helius' ability to mint new NFTs to your collection after the current mint is finished.">
                  <img src="/info.svg" alt="Info" className="mr-2 h-5 w-5" />
                </Tooltip>
                Revoke Collection Authority
              </Label>
              <div className="relative inline-block w-10 mr-2 align-middle select-none">
                <input
                  type="checkbox"
                  name="revokeAuthority"
                  id="revokeAuthority"
                  checked={revokeAuthority}
                  onChange={(e) => setRevokeAuthority(e.target.checked)}
                  className="hidden"
                />
                <label
                  htmlFor="revokeAuthority"
                  className="block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer w-10"
                >
                  <span
                    className={`absolute left-0.5 top-0.5 w-5 h-5 rounded-full bg-white transition-transform duration-300 ${
                      revokeAuthority ? "translate-x-5" : "translate-x-0"
                    }`}
                  >
                    {revokeAuthority && (
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
            <button
              className="w-full bg-orange-500 p-2 font-bold rounded-lg my-4"
              type="submit"
            >
              Import
            </button>
          </form>
        )}
        {txn && (
          <div className="my-6">
            <h2 className="text-xl font-bold text-center mb-4">
              Collection Imported!
            </h2>
            <button
              onClick={handleMintCollectionNavigation}
              className="w-full bg-orange-500 p-2 font-bold rounded-lg my-4 hover:bg-orange-600"
            >
              Go to Mint Collection
            </button>
          </div>
        )}
      </div>
      {alert && (
        <Alert
          color={alert.type}
          onDismiss={() => setAlert(null)}
          className="w-100 overflow-hidden mt-4"
        >
          <span>
            <p>
              <span className="font-sm text-center overflow-hidden">
                {alert.message}
              </span>
            </p>
          </span>
        </Alert>
      )}
    </>
  );
}
