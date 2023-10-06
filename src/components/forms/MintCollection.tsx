import { useState, useRef, useEffect } from "react";
import { Label, Alert, Progress } from "flowbite-react";
import defaultImage from "../../assets/default.jpeg";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useLocation } from "react-router-dom";
import { WebBundlr } from "@bundlr-network/client";
import {
  parseBatchAddresses,
  addAttribute,
  addCreator,
  removeAttribute,
  removeCreator,
  handleBatchFileUpload,
  handleImageChange,
  handleTabChange,
  TabType,
} from "../../../src/utils/forms";
import { createRevokeCollectionAuthorityInstruction } from "@metaplex-foundation/mpl-token-metadata";
import { useNetwork } from "../../../src/contexts/rpc";
import axios, { AxiosError } from "axios";
import { PhantomWalletAdapter, WalletConnectWalletAdapter } from "@solana/wallet-adapter-wallets";
import { generateJSONData } from "../../../src/utils/json";

export default function MintToCollection() {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [collectionName, setCollectionName] = useState("");
  const [collectionSymbol, setCollectionSymbol] = useState("");
  const [description, setDescription] = useState("");
  const [externalUrl, setExternalUrl] = useState("");
  const [royalties, setRoyalties] = useState<number>(0);
  const formRef = useRef<HTMLFormElement | null>(null);
  const [attributes, setAttributes] = useState([{ name: "", value: "" }]);
  const [creators, setCreators] = useState([{ address: "", share: 100 }]);
  const [amountToMint, setAmountToMint] = useState<number>(1);
  const [successfulMints, setSuccessfulMints] = useState<number>(0);
  const [showAlert, setShowAlert] = useState<boolean>(false);
  const { publicKey, wallet } = useWallet();
  const { connection } = useConnection();
  const { network } = useNetwork();
  const [image, setImage] = useState("");
  const [json, setJson] = useState("");
  const [alert, setAlert] = useState<{
    type: "success" | "failure";
    message: JSX.Element;
  } | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>("details");
  const [batchFile, setBatchFile] = useState<File | null>(null);
  const [batchAddresses, setBatchAddresses] = useState<string>("");
  const [mintOption, setMintOption] = useState("single-address"); // Default to "Single Address"
  const [singleAddress, setSingleAddress] = useState("");
  const [mintButtonClicked, setMintButtonClicked] = useState(false);
  const [latestSuccessfulSignature, setLatestSuccessfulSignature] = useState<
    string | null
  >(null);
  const [successfulSignatures, setSuccessfulSignatures] = useState<string[]>(
    []
  );

  const location = useLocation();
  const mint = location.state?.mint;
  const revoke = location.state?.revoke;

  // Inside your component:
  const handleAddAttribute = () => addAttribute(attributes, setAttributes);
  const handleRemoveAttribute = (index: number) =>
    removeAttribute(index, attributes, setAttributes);
  const handleAddCreator = () => addCreator(creators, setCreators);
  const handleRemoveCreator = () => removeCreator(creators, setCreators);
  const handleTabSwitch = (action: "next" | "previous") =>
    handleTabChange(activeTab as TabType, setActiveTab, action);
  const onImageChange = handleImageChange(setImagePreview);
  const onBatchFileUpload = handleBatchFileUpload(
    setBatchAddresses,
    setBatchFile
  );

  const delay = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));
  const MAX_RETRIES = 3;
  const RETRY_DELAY = 10000;
  const mintNFT = async (
    mintName: string,
    mintSymbol: string,
    owner: string,
    royalties: number,
    uri: string
  ) => {
    let retries = 0;
    while (retries < MAX_RETRIES) {
      try {
        const response = await axios.post(
          `https://proxy-gold-gamma.vercel.app/api/${network}-collection`,
          {
            jsonrpc: "2.0",
            id: "helius-test",
            method: "mintCompressedNft",
            params: {
              name: mintName,
              symbol: mintSymbol,
              owner: owner,
              uri: uri,
              collection: mint.toString(),
              sellerFeeBasisPoints: royalties,
            },
          },
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        return response.data.result;
      } catch (error: AxiosError | any) {
        if (error.response && error.response.status === 429) {
          // Check for 429 status
          retries++;
          setAlert({
            type: "failure",
            message: (
              <>
                <p> Too many requests. Retrying... </p>
              </>
            ),
          });
          await delay(RETRY_DELAY);
        } else {
          setAlert({
            type: "success",
            message: (
              <>
                <p> Mint Failed. Try again! </p>
              </>
            ),
          });
          throw error;
        }
      }
    }
  };
  function* generatePromises(promises: string | any[]) {
    for (let i = 0; i < promises.length; i++) {
      yield promises[i];
    }
  }

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
    setMintButtonClicked(true);
    if (activeTab !== "mint-details") {
      return;
    }
    setAlert({
      type: "success",
      message: (
        <>
          <p> Mint Submitted! </p>
        </>
      ),
    });
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
    const imageInput = document.getElementById("file") as HTMLInputElement;
    const file = imageInput?.files?.[0];
    if (!file) {
      setAlert({
        type: "failure",
        message: (
          <>
            <p> Please upload an image. </p>
          </>
        ),
      });
      return;
    }
    await window.solana.connect();
    const useProvider = wallet?.adapter as WalletConnectWalletAdapter;
    await useProvider.connect();
    let jsonUri = ""; 
    try {
      const bundlrURL =
        network === "mainnet"
          ? "https://node1.irys.xyz"
          : "https://devnet.irys.xyz";

      const providerUrl =
        network === "mainnet"
          ? process.env.REACT_APP_MAINNET_API_URL
          : process.env.REACT_APP_DEVNET_API_URL;
      const bundlr = new WebBundlr(bundlrURL, "solana", useProvider, {
        providerUrl: `${providerUrl}${process.env.REACT_APP_API_KEY}`,
      });
      await bundlr.ready();
      const fileBuffer = await readFileAsBuffer(file);
      const imagePrice = await bundlr.getPrice(file!.size);
      const fund = await bundlr.fund(imagePrice, 3);
      const tags = [{ name: "Content-Type", value: file.type }];
      const imageUpload = bundlr.createTransaction(fileBuffer, { tags });
      await imageUpload.sign();
      const imageResult = await imageUpload.upload();
      const imageUri = `https://arweave.net/${imageResult.id}`;
      setImage(imageUri);
      const jsonData = generateJSONData(
        file,
        imageUri,
        collectionName,
        description,
        externalUrl,
        attributes,
        creators,
        collectionSymbol,
        royalties,
        publicKey.toString()
      );
      const tagsForJson = [{ name: "Content-Type", value: "application/json" }];
      const upload = bundlr.createTransaction(
        JSON.stringify(jsonData, null, 2),
        { tags: tagsForJson }
      );
      await upload.sign();
      const result = await upload.upload();
     jsonUri = `https://arweave.net/${result.id}`
      setJson(jsonUri);
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
    if (activeTab === "mint-details" && mintButtonClicked) {
      const batchOfAddresses = parseBatchAddresses(batchAddresses);
      const totalMints =
        mintOption === "batch-addresses"
          ? batchOfAddresses.length
          : amountToMint;

      let promiseFunctions: any[] = [];

      // Populate promise functions based on mint type
      if (mintOption === "single-address") {
        promiseFunctions = Array(totalMints)
          .fill(null)
          .map(
            () => () =>
              mintNFT(
                collectionName,
                collectionSymbol,
                singleAddress.toString(),
                royalties,
                jsonUri
              )
          );
      } else {
        promiseFunctions = batchOfAddresses.map(
          (address) => () =>
            mintNFT(collectionName, collectionSymbol, address, royalties, json)
        );
      }
      const generator = generatePromises(promiseFunctions);
      let successfulMintsCounter = 0;

      for (let promiseFunction of generator) {
        try {
          const result = await promiseFunction();
          console.log("Minting API Response:", result);
          successfulMintsCounter++;
          if (result.signature) {
            setLatestSuccessfulSignature(result.signature);
            setSuccessfulSignatures((prev) => [...prev, result.signature]);
          }
        } catch (error) {
          console.log("Minting API Error:", error);
        } finally {
          setShowAlert(true);
          setSuccessfulMints(successfulMintsCounter);
          await delay(6000); // Wait for 6 seconds before the next request
        }
      }
    }
  };
  useEffect(() => {
    formRef.current?.scrollIntoView({ behavior: "auto" });
  }, []);
  return (
    <>
      <h1 className="text-center font-bold text-2xl mt-4">Mint cNFTs</h1>

      <div className="container mx-auto max-w-screen-md px-2 md:p-4 overflow-hidden">
        <div className="flex flex-col md:flex-row gap-4 border rounded-lg border-opacity-20 border-gray-200">
          <div className="flex flex-col gap-4 p-4 w-full md:w-1/3">
            <h2 className="text-xl font-bold text-center">Mint Preview</h2>
            <img
              src={imagePreview ? imagePreview : defaultImage}
              alt="Preview"
              className="w-48 h-48 rounded-lg mx-auto mb-4"
            />

            <div className="mb-2">
              <h3 className="text-md font-bold text-left mb-1">Name</h3>
              <hr className="my-1 opacity-50" />
              <p className="text-md">{collectionName}</p>
            </div>

            <div className="mb-2">
              <h3 className="text-md font-bold text-left mb-1">Symbol</h3>
              <hr className="my-1 opacity-50" />
              <p className="text-md">{collectionSymbol}</p>
            </div>

            <div className="flex-grow relative">
              <h3 className="text-md font-bold text-left mb-1 scrollbar-thin">Description</h3>
              <hr className="my-1 opacity-50" />
              <div
                className="overflow-y-auto h-24"
                style={{ wordWrap: "break-word" }}
              >
                <p className="text-sm">{description}</p>
              </div>
            </div>
          </div>

          <div className="w-full md:w-2/3 p-4">
            {/* Tab Switcher */}
            <div className="flex gap-4 mb-4">
              <button
                onClick={() => setActiveTab("details")}
                className={`p-2 text-lg rounded font-bold ${
                  activeTab === "details"
                    ? "text-orange-500 underline"
                    : "text-white bg-black text-opacity-80"
                }`}
              >
                Basic Details
              </button>
              <button
                onClick={() => setActiveTab("attributes")}
                className={`p-2 text-lg rounded font-bold ${
                  activeTab === "attributes"
                    ? "text-orange-500 underline"
                    : "text-white bg-black text-opacity-80"
                }`}
              >
                Optional Details
              </button>
              <button
                onClick={() => setActiveTab("mint-details")}
                className={`p-2 text-lg rounded font-bold ${
                  activeTab === "mint-details"
                    ? "text-orange-500 underline"
                    : "text-white bg-black text-opacity-80"
                }`}
              >
                Mint Details
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              ref={formRef}
              className="flex flex-col gap-2"
            >
              <div
                className="transition duration-300"
                style={{ height: "auto" }}
              >
                <div
                  id="detailsTab"
                  className={`${
                    activeTab === "details" ? "opacity-100" : "opacity-0"
                  } transition-opacity duration-500`}
                  style={{
                    visibility: activeTab === "details" ? "visible" : "hidden",
                    height: activeTab === "details" ? "auto" : 0,
                    overflow: "hidden",
                  }}
                >
                  <div className="max-w-md" id="fileUpload">
                    <Label
                      htmlFor="file"
                      value="Image"
                      className="mb-2 block text-white font-bold text-md"
                    />
                    <div className="relative hover:border-orange-600 transition-colors border border-gray-300 border-opacity-50 rounded-lg">
                      <input
                        type="file"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        id="file"
                        accept=".png, .jpeg, .gif"
                        onChange={onImageChange}
                        required={activeTab === "details"}
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
                    <div className="my-2 block">
                      <Label
                        htmlFor="collectionName"
                        value="Name"
                        className="block text-white font-bold text-md"
                      />
                    </div>
                    <input
                      maxLength={32}
                      onChange={(e) => setCollectionName(e.target.value)}
                      type="text"
                      id="collectionName"
                      className="bg-black border h-8 border-gray-300 border-opacity-50 text-white text-sm rounded-lg hover:border-orange-600 focus:ring-orange-600 focus:border-orange-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-orange-500 dark:focus:border-orange-500"
                      placeholder="e.g: Helius Hackers"
                      value={collectionName}
                      required={activeTab === "details"}
                    />
                  </div>

                  <div>
                    <div className="my-2 block">
                      <Label
                        htmlFor="collectionSymbol"
                        value="Symbol"
                        className="block text-white font-bold text-md"
                      />
                    </div>
                    <input
                      maxLength={12}
                      onChange={(e) => setCollectionSymbol(e.target.value)}
                      type="text"
                      id="collectionSymbol"
                      className="bg-black border h-8 border-gray-300 border-opacity-50 text-white text-sm rounded-lg hover:border-orange-600 focus:ring-orange-600 focus:border-orange-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-orange-500 dark:focus:border-orange-500"
                      placeholder="eg: HH"
                      value={collectionSymbol}
                      required={activeTab === "details"}
                    />
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
                      step="100"
                      max="10000"
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
                      {(royalties / 100).toFixed(2)}%
                    </div>
                  </div>
                  <div>
                    <div className="my-2 block text-white">
                      <Label
                        htmlFor="description"
                        value="Description"
                        className="block text-white font-bold text-md"
                      />
                    </div>
                    <textarea
                      id="description"
                      rows={4}
                      maxLength={400}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="scrollbar-thin block p-2.5 w-full text-sm text-white bg-black rounded-lg border border-gray-300 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-orange-500 dark:focus:border-orange-500"
                      placeholder='e.g: "Helius Hackers is a community of hackers who are passionate about building on Solana."'
                      required={activeTab === "details"}
                    />
                  </div>
                </div>
                <div
                  id="attributesTab"
                  className={`${
                    activeTab === "attributes" ? "opacity-100" : "opacity-0"
                  } transition-opacity duration-500`}
                  style={{
                    visibility:
                      activeTab === "attributes" ? "visible" : "hidden",
                    height: activeTab === "attributes" ? "auto" : 0,
                    overflow: "hidden",
                  }}
                >
                  <div>
                    <div className="my-2 block">
                      <Label
                        htmlFor="externalUrl"
                        value="External Url"
                        className="block text-white font-bold text-md"
                      />
                    </div>
                    <input
                      maxLength={50}
                      onChange={(e) => setExternalUrl(e.target.value)}
                      type="url"
                      id="externalUrl"
                      className="bg-black border h-8 border-gray-300 border-opacity-50 text-white text-sm rounded-lg hover:border-orange-600 focus:ring-orange-600 focus:border-orange-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-orange-500 dark:focus:border-orange-500"
                      placeholder="https://helius.dev"
                      value={externalUrl}
                    />
                  </div>
                  <h3 className="my-2 font-bold text-white">Attributes</h3>

                  {attributes.map((attr, index) => (
                    <div key={index} className="flex gap-2 items-center my-2">
                      <input
                        placeholder="Attribute Name"
                        value={attr.name}
                        onChange={(e) => {
                          const newAttributes = [...attributes];
                          newAttributes[index].name = e.target.value;
                          setAttributes(newAttributes);
                        }}
                        className="bg-black border h-8 border-gray-300 border-opacity-50 text-white text-sm rounded-lg hover:border-orange-600 focus:ring-orange-600 focus:border-orange-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-orange-500 dark:focus:border-orange-500"
                      />
                      <input
                        placeholder="Attribute Value"
                        value={attr.value}
                        onChange={(e) => {
                          const newAttributes = [...attributes];
                          newAttributes[index].value = e.target.value;
                          setAttributes(newAttributes);
                        }}
                        className="bg-black border h-8 border-gray-300 border-opacity-50 text-white text-sm rounded-lg hover:border-orange-600 focus:ring-orange-600 focus:border-orange-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-orange-500 dark:focus:border-orange-500"
                      />
                    </div>
                  ))}
                  <div className="flex justify-center gap-2 mt-2">
                    <button
                      type="button"
                      onClick={() => handleAddAttribute()}
                      className="w-8 h-8 bg-black border border-white rounded-full flex items-center justify-center"
                    >
                      +
                    </button>
                    {attributes.length > 1 && (
                      <button
                        type="button"
                        onClick={() =>
                          handleRemoveAttribute(attributes.length - 1)
                        }
                        className="w-8 h-8 bg-black border border-white rounded-full flex items-center justify-center"
                      >
                        -
                      </button>
                    )}
                  </div>
                  <h3 className="mb-2 font-bold text-white">Creators</h3>
                  {creators.map((creator, index) => (
                    <div key={index} className="flex gap-2 items-center my-2">
                      <input
                        placeholder="Creator Address"
                        value={creator.address}
                        onChange={(e) => {
                          const newCreators = [...creators];
                          newCreators[index].address = e.target.value;
                          setCreators(newCreators);
                        }}
                        className="bg-black border h-8 border-gray-300 border-opacity-50 text-white text-sm rounded-lg hover:border-orange-600 focus:ring-orange-600 focus:border-orange-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-orange-500 dark:focus:border-orange-500"
                      />
                      <input
                        placeholder="Share"
                        value={creator.share}
                        onChange={(e) => {
                          const newCreators = [...creators];
                          newCreators[index].share = Number(e.target.value);
                          setCreators(newCreators);
                        }}
                        className="bg-black border h-8 border-gray-300 border-opacity-50 text-white text-sm rounded-lg hover:border-orange-600 focus:ring-orange-600 focus:border-orange-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-orange-500 dark:focus:border-orange-500"
                      />
                    </div>
                  ))}
                  <div className="flex justify-center gap-2 mt-2">
                    <button
                      type="button"
                      onClick={handleAddCreator}
                      className="w-8 h-8 bg-black border border-white rounded-full flex items-center justify-center"
                    >
                      +
                    </button>
                    {creators.length > 1 && (
                      <button
                        type="button"
                        onClick={handleRemoveCreator}
                        className="w-8 h-8 bg-black border border-white rounded-full flex items-center justify-center"
                      >
                        -
                      </button>
                    )}
                  </div>
                </div>
                <div
                  id="mintDetailsTab"
                  className={`${
                    activeTab === "mint-details" ? "opacity-100" : "opacity-0"
                  } transition-opacity duration-500`}
                  style={{
                    visibility:
                      activeTab === "mint-details" ? "visible" : "hidden",
                    height: activeTab === "mint-details" ? "auto" : 0,
                    overflow: "hidden",
                  }}
                >
                  <div className="my-2 block">
                    <label
                      htmlFor="mint"
                      className="block text-white font-bold text-md my-2"
                    >
                      Collection ID
                    </label>
                    <input
                      type="text"
                      id="mint"
                      className="bg-black border h-8 border-gray-300 border-opacity-50 text-white text-sm rounded-lg hover:border-orange-600 focus:ring-orange-600 focus:border-orange-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-orange-500 dark:focus:border-orange-500"
                      value={mint}
                      disabled
                    />
                  </div>

                  <div className="my-2 block">
                    <label
                      htmlFor="amountToMint"
                      className="block text-white font-bold text-md my-2"
                    >
                      Amount to Mint
                    </label>
                    <input
                      type="number"
                      id="amountToMint"
                      className="bg-black border h-8 border-gray-300 border-opacity-50 text-white text-sm rounded-lg hover:border-orange-600 focus:ring-orange-600 focus:border-orange-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-orange-500 dark:focus:border-orange-500"
                      placeholder="Enter amount to mint"
                      value={amountToMint}
                      onChange={(e) => setAmountToMint(Number(e.target.value))}
                    />
                  </div>

                  <div className="block">
                    <label
                      htmlFor="mintOption"
                      className="block text-white font-bold text-md my-2"
                    >
                      Mint Type
                    </label>
                    <select
                      id="mintOption"
                      className="bg-black border h-12 border-gray-300 border-opacity-50 text-white text-sm rounded-lg hover:border-orange-600 focus:ring-orange-600 focus:border-orange-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-orange-500 dark:focus:border-orange-500"
                      value={mintOption}
                      onChange={(e) => setMintOption(e.target.value)}
                    >
                      <option value="single-address">Single Address</option>
                      <option value="batch-addresses">
                        Batch of Addresses
                      </option>
                    </select>
                  </div>

                  {mintOption === "single-address" && (
                    <div className="block">
                      <label
                        htmlFor="singleAddress"
                        className="block text-white font-bold text-md my-2"
                      >
                        Single Address
                      </label>
                      <input
                        type="text"
                        id="singleAddress"
                        className="bg-black border h-8 border-gray-300 border-opacity-50 text-white text-sm rounded-lg hover:border-orange-600 focus:ring-orange-600 focus:border-orange-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-orange-500 dark:focus:border-orange-500"
                        placeholder="Enter a single address"
                        value={singleAddress}
                        onChange={(e) => setSingleAddress(e.target.value)}
                      />
                    </div>
                  )}

                  {mintOption === "batch-addresses" && (
                    <div className="my-2 block">
                      <label
                        htmlFor="batchAddresses"
                        className="block text-white font-bold text-md my-1"
                      >
                        Batch Addresses (comma or space separated)
                      </label>
                      <textarea
                        id="batchAddresses"
                        className="bg-black border h-32 border-gray-300 border-opacity-50 text-white text-sm rounded-lg hover:border-orange-600 focus:ring-orange-600 focus:border-orange-500 block w-full p-2.5 resize-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-orange-500 dark:focus:border-orange-500"
                        placeholder="Enter batch addresses or upload CSV/JSON file"
                        value={batchAddresses}
                        onChange={(e) => setBatchAddresses(e.target.value)}
                      />
                      <h3 className="text-md font-bold my-1">
                        {" "}
                        Batch File (.json or .csv){" "}
                      </h3>
                      <div className="relative hover:border-orange-600 transition-colors border border-gray-300 border-opacity-50 rounded-lg">
                        <input
                          type="file"
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          id="batchFile"
                          accept=".csv, .json"
                          onChange={onBatchFileUpload}
                        />
                        <label
                          htmlFor="file"
                          className="flex items-center justify-center bg-black h-12 text-white text-sm rounded-lg w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                        >
                          <img
                            src="file.svg"
                            alt=""
                            className="w-8 h-8 text-gray-300 hover:text-orange-600"
                          />
                        </label>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex flex-col mt-4 justify-center">
                  {activeTab !== "mint-details" && (
                    <button
                      className="bg-white px-4 py-2 rounded-lg text-black font-bold w-full flex flex-col items-center"
                      onClick={() => handleTabSwitch("next")}
                    >
                      Next
                    </button>
                  )}

                  {activeTab === "mint-details" && (
                    <button
                      className="bg-[#E84125] px-4 py-2 rounded-lg text-white font-bold w-full 
                             hover:bg-orange-600 active:scale-95 transform transition-transform duration-150"
                      type="submit"
                      data-submit="mint"
                    >
                      Mint
                    </button>
                  )}
                </div>

                {/* <Progress
                labelProgress
                labelText
                progress={progress}
                progressLabelPosition="inside"
                size="lg"
                color="orange"
                textLabel="Minting Progress"
                textLabelPosition="outside"
                  /> */}
              </div>
            </form>
          </div>
        </div>
      </div>
      {showAlert && latestSuccessfulSignature && (
        <Alert
          color="success"
          className="w-96 flex justify-center m-auto items-center overflow-visible my-4 mb-8 z-50"
          onDismiss={() => {
            setShowAlert(false);
            setSuccessfulMints(0);
            setLatestSuccessfulSignature(null);
          }}
        >
          <span>
            <p className="font-medium">Success!</p>
            {successfulMints} cNFTs have been successfully minted. Keep this tab
            open until completed.
            <p>
              Mint Success!:
              <a
                href={`https://xray.helius.xyz/tx/${latestSuccessfulSignature}/?network=${network}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                View Transaction
              </a>
            </p>
          </span>
        </Alert>
      )}
    </>
  );
}
