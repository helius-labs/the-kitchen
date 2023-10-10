import { useState, useRef, useEffect } from "react";
import { Label, Alert } from "flowbite-react";
import defaultImage from "../../assets/default.jpeg";
import { useNavigate } from "react-router-dom";
import { useWallet, useConnection, WalletProvider } from "@solana/wallet-adapter-react";
import {
  Keypair,
  TransactionMessage,
  VersionedTransaction,
  SystemProgram,
  PublicKey,
} from "@solana/web3.js";
import {
  PROGRAM_ID as MPL_TOKEN_METADATA_PROGRAM_ID,
  createCreateMetadataAccountV3Instruction,
  createCreateMasterEditionV3Instruction,
  createSetCollectionSizeInstruction,
  createApproveCollectionAuthorityInstruction,
} from "@metaplex-foundation/mpl-token-metadata";
import {
  TOKEN_PROGRAM_ID,
  getMinimumBalanceForRentExemptMint,
  createMintToCheckedInstruction,
  createAssociatedTokenAccountInstruction,
  MINT_SIZE,
  getAssociatedTokenAddress,
  createInitializeMintInstruction,
} from "@solana/spl-token";
import BigNumber from "bignumber.js";
import { WebBundlr } from "@bundlr-network/client";
import { WalletConnectWalletAdapter } from "@solana/wallet-adapter-wallets";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-phantom";
import {
  getMasterEditionPDA,
  getCollectionAuthRecordPDA,
  getMetadataPDA,
} from "../../../src/utils/pdas";
import { handleImageChange } from "../../../src/utils/forms";
import { useNetwork } from "../../../src/contexts/rpc";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";

export default function CollectionForm() {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [collectionName, setCollectionName] = useState("");
  const [collectionSymbol, setCollectionSymbol] = useState("");
  const [description, setDescription] = useState("");
  const [royalties, setRoyalties] = useState<number>(0);
  const { network } = useNetwork();
  const [alert, setAlert] = useState<{
    type: "success" | "failure";
    message: JSX.Element;
  } | null>(null);
  const [txnAlert, setTxnAlert] = useState<{
    type: "success" | "failure";
    message: JSX.Element;
} | null>(null);
  const [mintKeyPair, setMintKeyPair] = useState<Keypair | null>(null);

  const formRef = useRef<HTMLFormElement | null>(null);
  const { publicKey, wallet, sendTransaction } = useWallet();
  const { connection } = useConnection();
  const [txn, setTxn] = useState<string | null>(null);
  const [newFile, setFile] = useState();
  const onImageChange = handleImageChange(setImagePreview);
  const [jsonUri, setJsonUri ] = useState<string | null>(null);
  const navigate = useNavigate();
  const handleMintCollectionNavigation = () => {
    navigate("/mint-cnft-collection", {
      state: { mint: mintKeyPair?.publicKey.toString() },
    });
  };
  const createCollection = async (
    publicKey: PublicKey | null,
    jsonUri: string
  ) => {
    if (!publicKey) {
      return;
    }
    try {
      const mint = Keypair.generate();
      setMintKeyPair(mint);
      let ata = await getAssociatedTokenAddress(mint.publicKey, publicKey);
      let newAuthorityAddress =
        network === "mainnet"
          ? "HnT5KVAywGgQDhmh6Usk4bxRg4RwKxCK4jmECyaDth5R"
          : "2LbAtCJSaHqTnP9M5QSjvAMXk79RNLusFspFN5Ew67TC";
      let newAuthority = new PublicKey(newAuthorityAddress);
      let tokenMetadataPubkey = await getMetadataPDA(mint.publicKey);
      let masterEditionPubkey = await getMasterEditionPDA(mint.publicKey);
      let collectionAuthorityPda = await getCollectionAuthRecordPDA(
        mint.publicKey,
        newAuthority
      );
      let instructions = [
        SystemProgram.createAccount({
          fromPubkey: publicKey,
          newAccountPubkey: mint.publicKey,
          space: MINT_SIZE,
          lamports: await getMinimumBalanceForRentExemptMint(connection),
          programId: TOKEN_PROGRAM_ID,
        }),
        // init mint
        createInitializeMintInstruction(
          mint.publicKey, // mint pubkey
          0,
          publicKey,
          publicKey,
          TOKEN_PROGRAM_ID
        ),
        createAssociatedTokenAccountInstruction(
          publicKey, // payer
          ata, // ata
          publicKey, // owner
          mint.publicKey,
          TOKEN_PROGRAM_ID // mint
        ),
        createMintToCheckedInstruction(mint.publicKey, ata, publicKey, 1, 0),
        createCreateMetadataAccountV3Instruction(
          {
            metadata: tokenMetadataPubkey,
            mint: mint.publicKey,
            mintAuthority: publicKey,
            payer: publicKey,
            updateAuthority: publicKey,
          },
          {
            createMetadataAccountArgsV3: {
              data: {
                name: collectionName.toString(),
                symbol: collectionSymbol.toString(),
                uri: jsonUri,
                sellerFeeBasisPoints: Number(royalties),
                creators: [{ address: publicKey, verified: true, share: 100 }],
                collection: null,
                uses: null,
              },
              isMutable: true,
              collectionDetails: null,
            },
          }
        ),
        createCreateMasterEditionV3Instruction(
          {
            edition: masterEditionPubkey,
            mint: mint.publicKey,
            updateAuthority: publicKey,
            mintAuthority: publicKey,
            payer: publicKey,
            metadata: tokenMetadataPubkey,
          },
          {
            createMasterEditionArgs: {
              maxSupply: 0,
            },
          }
        ),
        createSetCollectionSizeInstruction(
          {
            collectionMetadata: tokenMetadataPubkey,
            collectionAuthority: publicKey,
            collectionMint: mint.publicKey,
          },
          {
            setCollectionSizeArgs: { size: 0 },
          }
        ),
        createApproveCollectionAuthorityInstruction({
          metadata: tokenMetadataPubkey,
          mint: mint.publicKey,
          collectionAuthorityRecord: collectionAuthorityPda,
          updateAuthority: publicKey,
          newCollectionAuthority: newAuthority,
          payer: publicKey,
        }),
      ];
      let latestBlockhash = await connection.getLatestBlockhash();
      const message = new TransactionMessage({
        payerKey: publicKey,
        recentBlockhash: latestBlockhash.blockhash,
        instructions,
      }).compileToV0Message();
      const transaction = new VersionedTransaction(message);
      const signature = transaction.sign([mint]);
      const txid = await sendTransaction(transaction, connection);
      const confirmedTransaction = await connection.confirmTransaction(
        txid,
        "confirmed"
      );
      if (confirmedTransaction.value.err) {
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
      return txid;
    } catch (e) {
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

  const readFileAsBuffer = (file: File): Promise<Buffer> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          resolve(Buffer.from(event.target.result as ArrayBuffer));
        } else {
          reject(new Error("Failed to read the file."));
        }
      };
      reader.onerror = (error) => reject(error);
      reader.readAsArrayBuffer(file);
    });
  };

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    if (!publicKey) {
      setAlert({
        type: "failure",
        message: (
          <>
            <p> Please connect wallet. </p>
          </>
        ),
      });
      return;
    }
    if (!collectionName || !collectionSymbol || !description) {
      const missingFields = [];
      if (!collectionName) missingFields.push("Collection Name");
      if (!collectionSymbol) missingFields.push("Collection Symbol");
      if (!description) missingFields.push("Description");
      if (!imagePreview) missingFields.push("Image");
      setAlert({
        type: "failure",
        message: (
          <>
            <p> Please fill in all required fields: {missingFields.join(", ")}. </p>
          </>
        ),
      });
      return;
    }
    setAlert({
      type: "success",
      message: (
        <>
          <p> Creating collection...</p>
        </>
      ),
    });
    const imageInput = document.getElementById("file") as HTMLInputElement;
    const file = imageInput?.files?.[0];
    if (!file) return;
    
    const bundlrURL =
      network === "mainnet"
        ? "https://node1.irys.xyz"
        : "https://devnet.irys.xyz";

    const providerUrl =
      network === "mainnet"
        ? process.env.REACT_APP_MAINNET_API_URL
        : process.env.REACT_APP_DEVNET_API_URL;
    try {
      await window.solana.connect();
      const useProvider = wallet?.adapter as WalletConnectWalletAdapter;
      await useProvider.connect();
      const bundlr = new WebBundlr(bundlrURL, "solana", useProvider, {
        providerUrl: `${providerUrl}${process.env.REACT_APP_API_KEY}`,
      });
      await bundlr.ready();
      const tagsForImage = [{ name: "Content-Type", value: file.type }];
      const tagsForJson = [{ name: "Content-Type", value: "application/json" }];
      let jsonUri = "";
    try { 
      const imagePrice = await bundlr.getPrice(file!.size + 1048576);
      const funds = await bundlr.fund(imagePrice)
      const fileBuffer = await readFileAsBuffer(file);
      const imageUpload = bundlr.createTransaction(fileBuffer, { tags: tagsForImage })
      await imageUpload.sign()
      const imageResult = await imageUpload.upload()
      const imageUri = `https://arweave.net/${imageResult.id}`
      if(imageUri) { 
        setAlert({
          type: "success",
          message: (
            <>
              <p> Image uploaded. </p>
            </>
          ),
        });
      }
      const jsonData = {
        name: collectionName,
        symbol: collectionSymbol,
        description: description,
        seller_fee_basis_points: royalties,
        image: imageUri,
        collection: {},
        attributes: [],
        properties: {
          category: "image",
          creators: [
            {
              address: publicKey.toString(),
              share: 100,
            },
          ],
        },
      };
      const jsonPrice = await bundlr.getPrice(JSON.stringify(jsonData, null, 2).length);
      const fund = await bundlr.fund(jsonPrice, 12)
      const upload = bundlr.createTransaction(JSON.stringify(jsonData, null, 2), { tags: tagsForJson })
      await upload.sign()
      const result = await upload.upload()
      jsonUri = `https://arweave.net/${result.id}`
      if(jsonUri) { 
        setAlert({
          type: "success",
          message: (
            <>
              <p> Json uploaded. 
                <a href={jsonUri} target="_blank"
                rel="noopener noreferrer"> View Here </a>
              </p>
            </>
          ),
        });
      }
      setJsonUri(jsonUri)
    } catch (e) {
      console.log(e)
      setAlert({
        type: "failure",
        message: (
          <>
            <p> Failed to upload image. </p>
          </>
        ),
      });
      return;
    }
      const txn = await createCollection(publicKey, jsonUri);
      if (!txn) {
        setAlert({
          type: "failure",
          message: (
            <>
              <p> Transaction failed. </p>
            </>
          ),
        });
        return;
      } else { 
        setTxnAlert({
          type: "success",
          message: (
              <>
                  Transaction was successful!&nbsp;
                  <a
                      href={`https://xray.helius.xyz/tx/${txn}?network=${network}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline"
                  >
                      View Transaction
                  </a>
              </>
          ),
      });
      }
    } catch (e) {
      setAlert({
        type: "failure",
        message: (
          <>
            <p> Failed to fund node. </p>
          </>
        ),
      });
      return;
    }
    
  };
  useEffect(() => {
    formRef.current?.scrollIntoView({ behavior: "auto" });
  }, []);
  return (
    <>
      {!txn && wallet?.adapter.connected  && (
        <div className="container mx-auto max-w-screen-xl p-4 my-8 md:my-0 overflow-y-auto max-h-screen mb-5">
          <h2 className="text-center font-bold text-2xl mb-2">
            Step 1: Create Collection
          </h2>
          <div className="flex flex-col md:flex-row gap-6 border rounded-lg border-opacity-20 border-gray-200 p-6">
            {/* Preview Section */}
            <div className="flex flex-col gap-4 w-full md:w-1/2">
              <h2 className="text-xl font-bold text-center">
                Collection Preview
              </h2>
              <div className="image-upload w-48">
              <img
                src={imagePreview ? imagePreview : defaultImage}
                alt="Preview"
                className="h-48 w-48 rounded-lg mx-auto hover:opacity-80 cursor-pointer object-cover"
              />
              </div>
              <div>
                <h3 className="text-base font-bold mt-4">Name</h3>
                <p className="text-md">{collectionName}</p>
              </div>
              <div>
                <h3 className="text-base font-bold mt-4">Symbol</h3>
                <p className="text-sm">{collectionSymbol}</p>
              </div>
              <div className="relative mt-4 flex-grow">
                <h3 className="text-base font-bold">Description</h3>
                <p className="text-sm mt-2 text-opacity-80 max-h-24 overflow-y-auto scrollbar-thin">
                  {description}
                </p>
              </div>
            </div>

            {/* Form Section */}
            <form
              onSubmit={handleSubmit}
              ref={formRef}
              className="flex flex-col gap-4 w-full py-4 md:py-0"
            >
              <div className="max-w-md" id="fileUpload">
                <Label
                  htmlFor="file"
                  value="Collection Image"
                  className="mb-2 block text-white font-bold text-md"
                />
                <div className="relative hover:border-orange-600 transition-colors border border-gray-300 border-opacity-50 rounded-lg">
                  <input
                    accept=".png, .jpeg, .jpg, .gif"
                    type="file"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    id="file"
                    onChange={onImageChange}
                  />
                  <label
                    htmlFor="file"
                    className="flex items-center justify-center bg-black h-12 text-white text-sm rounded-lg w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                  >
                    <img
                      src="image.svg"
                      alt=""
                      className="w-8 h-8 text-gray-300 hover:text-orange-600"
                    />
                  </label>
                </div>
              </div>

              <div>
                <Label
                  htmlFor="collectionName"
                  value="Collection Name"
                  className="mb-2 block text-white font-bold text-md"
                />
                <input
                  maxLength={32}
                  onChange={(e) => setCollectionName(e.target.value)}
                  type="text"
                  id="collectionName"
                  className="bg-black border h-8 border-gray-300 border-opacity-50 text-white text-sm rounded-lg hover:border-orange-600 focus:ring-orange-600 focus:border-orange-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-orange-500 dark:focus:border-orange-500"
                  placeholder="e.g: Helius Hackers"
                  value={collectionName}
                />
              </div>
              <div>
                <Label
                  htmlFor="collectionSymbol"
                  value="Collection Symbol"
                  className="mb-2 block text-white font-bold text-md"
                />
                <input
                  maxLength={12}
                  onChange={(e) => setCollectionSymbol(e.target.value)}
                  type="text"
                  id="collectionSymbol"
                  className="bg-black border h-8 border-gray-300 border-opacity-50 text-white text-sm rounded-lg hover:border-orange-600 focus:ring-orange-600 focus:border-orange-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-orange-500 dark:focus:border-orange-500"
                  placeholder="eg: HH"
                  value={collectionSymbol}
                />
              </div>
              <div>
                <Label
                  htmlFor="description"
                  value="Description"
                  className="mb-2 block text-white font-bold text-md"
                />
                <textarea
                  id="description"
                  rows={4}
                  maxLength={400}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="scrollbar-thin block p-2.5 w-full text-sm text-white bg-black rounded-lg border border-gray-300 hover:border-orange-600 focus:ring-orange-600 focus:border-orange-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-orange-500 dark:focus:border-orange-500"
                  placeholder='e.g: "Helius Hackers is a community of hackers who are passionate about building on Solana."'
                ></textarea>
              </div>
              <div className="relative w-full my-2">
                <Label
                  htmlFor="royaltiesSlider"
                  value="Royalties"
                  className="block text-white font-bold text-md mb-2"
                />
                <input
                  type="range"
                  id="royaltiesSlider"
                  min="0"
                  max="10000"
                  step="100"
                  value={royalties}
                  onChange={(e) => setRoyalties(Number(e.target.value))}
                  className="w-full h-2 rounded-full bg-gray-300 appearance-none outline-none custom-slider"
                  style={{
                    backgroundImage: `linear-gradient(to right, #E84125 0%, #E84125 ${
                      royalties / 100
                    }%, #D1D5DB ${royalties / 100}%, #D1D5DB 100%)`,
                  }}
                />
                <div className="absolute top-0 right-0 mt-2 text-white">
                  {(royalties / 100)}%
                </div>
              </div>
              <button
               className="bg-[#E84125] px-4 py-2 text-lg rounded-lg text-white font-bold w-full 
               hover:bg-orange-600 active:scale-95 transform transition-transform duration-150"
                type="submit"
              >
                Create
              </button>
            </form>
          </div>
        </div>
      )}
      {txn && (
        <div className="my-6">
          <h2 className="text-xl font-bold text-center mb-4">
            Collection Minted!
          </h2>{" "}
          <div className="flex items-start gap-6 border rounded-lg border-gray-400 shadow-lg p-4 bg-black">
            {/* Image */}
            <div className="image-upload">
              <img
                src={imagePreview ? imagePreview : defaultImage}
                alt="Preview"
                className="w-48 h-48 rounded-lg hover:opacity-80 cursor-pointer object-cover"
              />
            </div>

            {/* Details */}
            <div className="flex-1">
              <div className="mb-4">
                <h3 className="text-base font-bold">Name</h3>
                <p className="text-md">{collectionName}</p>
              </div>
              <div className="mb-4">
                <h3 className="text-base font-bold">Symbol</h3>
                <p className="text-sm">{collectionSymbol}</p>
              </div>
              <div className="relative flex-grow mb-4">
                <h3 className="text-base font-bold">Description</h3>
                <p className="text-sm mt-2 text-opacity-80 max-h-24 overflow-y-auto">
                  {description}
                </p>
              </div>
            </div>
          </div>
          {/* Go to Mint Collection Button */}
          <button onClick={handleMintCollectionNavigation} className="bg-[#E84125] px-4 py-2 text-lg rounded-lg text-white font-bold w-full my-4
                            hover:bg-orange-600 active:scale-95 transform transition-transform duration-150"> 
            Go to Mint Collection
          </button>
        </div>
      )}
{alert && !txnAlert && (
    <Alert
        color={alert.type}
        onDismiss={() => setAlert(null)}
        className="w-96 flex justify-center items-center overflow-visible my-4 mb-8 absolute bottom-0 left-28 z-50"
    >
        <span>
            <p>
                <span className="font-sm text-center overflow-visible">
                    {alert.message}
                </span>
            </p>
        </span>
    </Alert>
)}

{txnAlert && (
    <Alert
        color={txnAlert.type}
        onDismiss={() => setTxnAlert(null)}
        className="w-96 flex justify-center items-center overflow-visible my-4 mb-8 absolute top-50 right-28 z-50" // Modify the className to change the position of this alert
    >
        <span>
            <p>
                <span className="font-sm text-center overflow-visible">
                    {txnAlert.message}
                </span>
            </p>
        </span>
    </Alert>
)}
    </>
  );
}