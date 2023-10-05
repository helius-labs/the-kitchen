import { useState } from "react";
import CollectionForm from "./CollectionForm";
import ExistingCollectionForm from "./ExistingCollection";
import { useTransaction } from "../../../src/contexts/transaction";
export default function ToggleForm() {
  const [showExistingCollectionForm, setShowExistingCollectionForm] =
    useState(false);
  const { txn } = useTransaction();

  if (txn) {
    return (
      <div className="flex flex-col items-center justify-start min-h-screen mt-50 scrollbar-thin">
        <div
          className="w-full max-w-xl relative -mt-6"
          style={{ height: "400px" }}
        >
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              opacity: showExistingCollectionForm ? 0 : 1,
              visibility: showExistingCollectionForm ? "hidden" : "visible",
              transition: "opacity 0.5s, visibility 0.5s",
            }}
          >
            <CollectionForm />
          </div>
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              opacity: showExistingCollectionForm ? 1 : 0,
              visibility: showExistingCollectionForm ? "visible" : "hidden",
              transition: "opacity 0.5s, visibility 0.5s",
            }}
          >
            <ExistingCollectionForm />
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="flex flex-col items-center justify-start min-h-screen mt-50">
      <div className="mb-4 flex flex-col items-center justify-center">
        <div className="flex justify-between items-center w-full max-w-xl">
          <h1 className="text-xl font-bold">{showExistingCollectionForm}</h1>
          <div className="flex items-center">
            <span className="mr-2 text-white font-bold my-4">
              Import Existing Collection
            </span>

            <div className="relative inline-block w-10 align-middle select-none">
              <input
                type="checkbox"
                checked={showExistingCollectionForm}
                onChange={() => setShowExistingCollectionForm((prev) => !prev)}
                className="hidden"
                id="toggleCollectionForm"
              />
              <label
                htmlFor="toggleCollectionForm"
                className="block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer w-10"
              >
                <span
                  className={`absolute left-0.5 top-0.5 w-5 h-5 rounded-full bg-white transition-transform duration-300 ${
                    showExistingCollectionForm
                      ? "translate-x-5"
                      : "translate-x-0"
                  }`}
                >
                  {showExistingCollectionForm && (
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
        </div>
      </div>

      <div
        className="w-full max-w-xl relative -mt-6"
        style={{ height: "400px" }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            opacity: showExistingCollectionForm ? 0 : 1,
            visibility: showExistingCollectionForm ? "hidden" : "visible",
            transition: "opacity 0.5s, visibility 0.5s",
          }}
        >
          <CollectionForm />
        </div>
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            opacity: showExistingCollectionForm ? 1 : 0,
            visibility: showExistingCollectionForm ? "visible" : "hidden",
            transition: "opacity 0.5s, visibility 0.5s",
          }}
        >
          <ExistingCollectionForm />
        </div>
      </div>
    </div>
  );
}
