
import React from 'react';
import { StarIcon } from './icons/StarIcon';

export const Header: React.FC = () => {
  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center py-6">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 tracking-tight">
            Product Shot Guide
          </h1>
          <div className="flex items-center mt-2 text-sm font-semibold tracking-widest text-[#002855]">
            AMERICAN
            <StarIcon className="w-4 h-4 mx-1.5 text-[#C8102E]" />
            BATH GROUP
          </div>
        </div>
      </div>
    </header>
  );
};
