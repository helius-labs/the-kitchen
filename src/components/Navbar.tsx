import { Tooltip } from 'flowbite-react';
import React from 'react';

const Navbar: React.FC = () => {
    return (
        <div className="flex justify-between items-center p-2 bg-grey text-white">
            <a href='/'> <img className='w-1/6 mt-[-10px]' src='helius.png'alt='' /> </a>
            <Tooltip content="Github Repository">
            <a href='https://github.com/helius-labs/the-kitchen'> <img className='h-6 mt-[-10px]' src='docs.svg' alt='' /> </a>
            </Tooltip>
            <Tooltip content="Docs">
            <a href='https://docs.helius.dev/welcome/what-is-helius'> <img className='h-6 mx-6 mt-[-10px]' src='github.svg' alt='' /> </a>
            </Tooltip>
        </div>
    );
}

export default Navbar;