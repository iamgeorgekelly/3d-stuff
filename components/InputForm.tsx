
import React, { useState } from 'react';
import { PRODUCT_CATEGORIES } from '../constants';
import type { FormState } from '../types';
import { Spinner } from './Spinner';

interface InputFormProps {
  onGenerate: (formState: FormState) => void;
  isLoading: boolean;
}

export const InputForm: React.FC<InputFormProps> = ({ onGenerate, isLoading }) => {
  const [formState, setFormState] = useState<FormState>({
    productCategory: 'Bathtubs',
    style: 'Modern Minimalist with natural wood accents',
    uploadedImages: [],
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormState(prevState => ({ ...prevState, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
        const files = Array.from(e.target.files);
        // Reset target value to allow re-uploading the same file
        e.target.value = '';
        
        files.forEach(file => {
            const reader = new FileReader();
            reader.onload = (loadEvent) => {
                const base64 = (loadEvent.target?.result as string)?.split(',')[1];
                if (base64) {
                    setFormState(prevState => ({
                        ...prevState,
                        uploadedImages: [...prevState.uploadedImages, { base64, mimeType: file.type }]
                    }));
                }
            };
            reader.readAsDataURL(file);
        });
    }
  };

  const removeImage = (index: number) => {
    setFormState(prevState => ({
        ...prevState,
        uploadedImages: prevState.uploadedImages.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGenerate(formState);
  };

  return (
    <div className="bg-white p-6 md:p-8 rounded-xl shadow-lg border border-gray-200">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="productCategory" className="block text-sm font-medium text-gray-700 mb-1">
              Product Category
            </label>
            <select
              id="productCategory"
              name="productCategory"
              value={formState.productCategory}
              onChange={handleChange}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-[#002855] focus:border-[#002855] sm:text-sm rounded-md"
              required
            >
              {PRODUCT_CATEGORIES.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="style" className="block text-sm font-medium text-gray-700 mb-1">
              Desired Style
            </label>
            <input
              type="text"
              id="style"
              name="style"
              value={formState.style}
              onChange={handleChange}
              className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-[#002855] focus:border-[#002855]"
              placeholder="e.g., Japandi, Luxury Classic"
              required
            />
          </div>
        </div>

        <div>
            <label htmlFor="file-upload" className="block text-sm font-medium text-gray-700 mb-1">
                Product Image(s) <span className="text-gray-500 font-semibold">(Required)</span>
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                    <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <div className="flex text-sm text-gray-600">
                        <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-[#002855] hover:text-[#C8102E] focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-[#002855]">
                            <span>Upload files</span>
                            <input id="file-upload" name="file-upload" type="file" className="sr-only" multiple onChange={handleFileChange} accept="image/png, image/jpeg" />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">PNG or JPG. Provide multiple angles.</p>
                </div>
            </div>
        </div>

        {formState.uploadedImages.length > 0 && (
            <div>
                <p className="block text-sm font-medium text-gray-700 mb-2">Image Previews:</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {formState.uploadedImages.map((image, index) => (
                        <div key={index} className="relative group aspect-w-1 aspect-h-1">
                            <img src={`data:${image.mimeType};base64,${image.base64}`} alt={`preview ${index}`} className="w-full h-full object-cover rounded-md border shadow-sm" />
                            <button
                                type="button"
                                onClick={() => removeImage(index)}
                                className="absolute top-1 right-1 bg-red-600 text-white rounded-full h-5 w-5 flex items-center justify-center text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100"
                                aria-label="Remove image"
                            >
                                <span className="sr-only">Remove image</span>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        )}
        
        <div className="pt-2">
            <button
                type="submit"
                disabled={isLoading || formState.uploadedImages.length === 0}
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#C8102E] hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200"
            >
                {isLoading ? (
                    <>
                        <Spinner className="-ml-1 mr-3 text-white" />
                        Generating...
                    </>
                ) : (
                    'Generate Scene'
                )}
            </button>
        </div>
      </form>
    </div>
  );
};