import React from "react";

interface HeaderProps {
  imageUrl: string;
}

const Header: React.FC<HeaderProps> = ({ imageUrl }) => {
  return (
    <div
      className="relative h-[250px] bg-cover bg-center"
      style={{ backgroundImage: `url(${imageUrl})` }}
    >
      <div className="absolute inset-0 bg-black opacity-70"></div>

      <div className="absolute inset-0 flex flex-col justify-center items-center z-10">
        <h1 className="text-7xl font-extrabold text-[#E84125] text-center">
          The Kitchen
        </h1>
        <p className="text-center my-2 w-full">
          Cook up some tasty cNFTs, for free.
        </p>
      </div>
    </div>
  );
};

export default Header;
