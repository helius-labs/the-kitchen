export const parseBatchAddresses = (input: string): string[] => {
    return input
      .split(/[\s,]+/)
      .map((address) => address.replace(/['"]+/g, ""))
      .filter(Boolean);
  };

type Attribute = { name: string; value: string };
type Creator = { address: string; share: string };

export const addAttribute = (
  attributes: Attribute[],
  setAttributes: React.Dispatch<React.SetStateAction<Attribute[]>>
) => {
  setAttributes([...attributes, { name: "", value: "" }]);
};

export const removeAttribute = (
  index: number,
  attributes: Attribute[],
  setAttributes: React.Dispatch<React.SetStateAction<Attribute[]>>
) => {
  const newAttributes = [...attributes];
  newAttributes.splice(index, 1);
  setAttributes(newAttributes);
};

export const addCreator = (
  creators: Creator[],
  setCreators: React.Dispatch<React.SetStateAction<Creator[]>>
) => {
  if (creators.length < 5) {
    setCreators([...creators, { address: "", share: "" }]);
  }
};

export const removeCreator = (
  creators: Creator[],
  setCreators: React.Dispatch<React.SetStateAction<Creator[]>>
) => {
  if (creators.length > 1) {
    const newCreators = [...creators];
    newCreators.pop();
    setCreators(newCreators);
  }
};

export type TabType = "details" | "attributes" | "mint-details";

export const handleTabChange = (
  activeTab: TabType,
  setActiveTab: React.Dispatch<React.SetStateAction<TabType>>,
  action: "next" | "previous"
) => {
  if (action === "next") {
    if (activeTab === "details") {
      setActiveTab("attributes");
    } else if (activeTab === "attributes") {
      setActiveTab("mint-details");
    }
  } else if (action === "previous") {
    if (activeTab === "attributes") {
      setActiveTab("details");
    } else if (activeTab === "mint-details") {
      setActiveTab("attributes");
    }
  }
};

export const handleImageChange = (
  setImagePreview: React.Dispatch<React.SetStateAction<string | null>>
): React.ChangeEventHandler<HTMLInputElement> => async (event) => {
  const file = event.target.files && event.target.files[0];
  const reader = new FileReader();
  if (file) {
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  }
};

export const handleBatchFileUpload = (
  setBatchAddresses: React.Dispatch<React.SetStateAction<string>>,
  setBatchFile: React.Dispatch<React.SetStateAction<File | null>>
) => {
  return (event: React.ChangeEvent<HTMLInputElement>) => {
  const file = event.target.files?.[0];
  if (file) {
    const reader = new FileReader();

    reader.onload = (e) => {
      const fileContent = e?.target?.result as string;

      if (file.name.endsWith(".json")) {
        try {
          const parsedContent = JSON.parse(fileContent);

          if (Array.isArray(parsedContent) && typeof parsedContent[0] === "string") {
            setBatchAddresses(parsedContent.join("\n"));
          } else {
            // Handle other JSON formats or show an error
          }
        } catch (error) {
          console.error("Error parsing JSON:", error);
        }
      } else if (file.name.endsWith(".csv")) {
        setBatchAddresses(fileContent);
      } else {
        // Handle other file types or show an error
      }
    };

    reader.readAsText(file);
  } else {
    setBatchFile(null);
    setBatchAddresses("");
  }
}
};