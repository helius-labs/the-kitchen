import { useState, useRef, useEffect } from "react";
import { Label, FileInput } from "flowbite-react";
import defaultImage from "../assets/default.jpeg";
export default function CollectionForm() {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [collectionName, setCollectionName] = useState("");
  const [collectionSymbol, setCollectionSymbol] = useState("");
  const [description, setDescription] = useState("");
  const [royalties, setRoyalties] = useState("");
  const formRef = useRef<HTMLFormElement | null>(null);

  const handleImageChange: React.ChangeEventHandler<HTMLInputElement> = (
    event
  ) => {
    const file = event.target.files && event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  useEffect(() => {
    formRef.current?.scrollIntoView({ behavior: "auto" });
  }, []);
  return (
    <>
      <h1 className="text-center font-bold text-xl mt-4">
        {" "}
        Step 1: Mint cNFTs
      </h1>
      <div className="grid grid-cols-1 lg:flex lg:justify-center lg:gap-4">
        <form
          ref={formRef}
          className="flex flex-col gap-2 p-4 max-w-md pb-10 border rounded-lg mt-4 border-opacity-20 border-gray-200"
        >
          <div className="max-w-md" id="fileUpload">
            <div className="mb-2 block">
              <Label
                htmlFor="file"
                value="Upload Image"
                className="text-white"
              />
            </div>
            <FileInput id="file" sizing={"sm"} onChange={handleImageChange} />
          </div>
          <div>
            <div className="mb-1 block">
              <Label
                htmlFor="collectionName"
                value="Collection Name"
                className="text-white"
              />
            </div>
            <input
              maxLength={32}
              onChange={(e) => setCollectionName(e.target.value)}
              type="text"
              id="collectionName"
              className="bg-black border h-8 border-gray-300 border-opacity-50 text-white text-sm rounded-lg focus:ring-orange-500 focus:border-orange-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-orange-500 dark:focus:border-orange-500"
              placeholder="e.g: Helius Hackers"
              value={collectionName}
              required
            />
          </div>
          <div>
            <div className="mb-1 block">
              <Label
                htmlFor="collectionSymbol"
                value="Collection Symbol"
                className="text-white"
              />
            </div>
            <input
              maxLength={32}
              onChange={(e) => setCollectionSymbol(e.target.value)}
              type="text"
              id="collectionSymbol"
              className="bg-black border h-8 border-gray-300 border-opacity-50 text-white text-sm rounded-lg focus:ring-orange-500 focus:border-orange-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-orange-500 dark:focus:border-orange-500"
              placeholder="eg: HH"
              value={collectionSymbol}
              required
            />
          </div>
          <div>
            <div className="mb-1 block">
              <Label
                htmlFor="creators"
                value="Creators"
                className="text-white"
              />
            </div>
            <input
              maxLength={32}
              onChange={(e) => setCollectionSymbol(e.target.value)}
              type="text"
              id="creators"
              className="bg-black border h-8 border-gray-300 border-opacity-50 text-white text-sm rounded-lg focus:ring-orange-500 focus:border-orange-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-orange-500 dark:focus:border-orange-500"
              placeholder="eg: HH"
              value={collectionSymbol}
              required
            />
          </div>
          <div>
            <div className="mb-1 block text-white">
              <Label
                htmlFor="description"
                value="Description"
                className="text-white"
              />
            </div>
            <textarea
              id="message"
              rows={4}
              maxLength={250}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="block p-2.5 w-full text-sm text-white bg-black rounded-lg border border-gray-300 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-orange-500 dark:focus:border-orange-500"
              placeholder='e.g: "Helius Hackers is a community of hackers who are passionate about building on Solana."'
            ></textarea>
          </div>
          <div>
            <div className="mb-1 block text-white">
              <Label
                htmlFor="royalities1"
                value="Royalties"
                className="text-white"
              />
            </div>
            <input
              maxLength={32}
              onChange={(e) => setRoyalties(e.target.value)}
              type="number"
              id="collectionSymbol"
              className="bg-black border h-8 border-gray-300 border-opacity-50 text-white text-sm rounded-lg focus:ring-orange-500 focus:border-orange-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-orange-500 dark:focus:border-orange-500"
              placeholder="e.g: 10%"
              value={royalties}
              required
            />
         
          </div>

          <button
            className="w-full bg-orange-500 p-2 font-bold rounded-lg my-4"
            type="submit"
          >
            Submit
          </button>
        </form>

        <div className="flex flex-col gap-4 mt-4 p-4 h-[450px] border rounded-lg border-opacity-20 border-gray-200 w-72">
          <h2 className="text-lg font-semibold text-center flex-none">
            Mint Preview
          </h2>
          <img
            src={imagePreview ? imagePreview : defaultImage}
            alt="Preview"
            className="w-24 h-24 rounded-lg mx-auto flex-none"
          />
          <div className="flex-none">
            <h3 className="text-lg font-semibold text-left">Name</h3>
            <p className="text-md">{collectionName}</p>
          </div>
          <div className="flex-none mt-[-10px]">
            <h3 className="text-lg font-semibold text-left">Symbol</h3>
            <p className="text-sm">{collectionSymbol}</p>
          </div>
          <div className="flex-grow relative mt-[-10px]">
            <h3 className="text-lg font-semibold text-left">Description</h3>
            <p className="text-sm overflow-y-auto absolute top-7 left-0 right-0 bottom-0">
              {description}
            </p>
          </div>
          <div className="flex-none">
            <h3 className="text-lg font-semibold text-left">Royalties</h3>
            <p className="text-sm">{royalties}%</p>
          </div>
        </div>
      </div>
    </>
  );
}
