/** @type {import('tailwindcss').Config} */
export const content = ["./src/**/*.{js,jsx,ts,tsx}", "node_modules/flowbite-react/**/*.{js,jsx,ts,tsx}"];

export const theme = {
  extend: {
    colors: {
      orange: "#E84125",
      "orange-transparent": "rgb(234, 88, 12, 0.8)",
      "off-black-0.5": "rgb(7, 7, 7, 0.5)",
      "off-black": "rgb(7, 7, 7)",
    },
  },
};

export const plugins = [require("flowbite/plugin")];
