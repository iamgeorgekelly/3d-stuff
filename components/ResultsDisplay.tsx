import React, { useState } from 'react';
import JSZip from 'jszip';
import type { SceneData } from '../types';
import { Spinner } from './Spinner';
import { DownloadIcon } from './icons/DownloadIcon';

interface ResultsDisplayProps {
  sceneData: SceneData | null;
  isLoading: boolean;
  loadingMessage: string;
  error: string | null;
  onReset: () => void;
}

const ImageCard: React.FC<{ shot: SceneData['shot_sequence'][0], isMain: boolean }> = ({ shot, isMain }) => {
    const cardClasses = `bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 transition-all duration-300 hover:shadow-xl ${isMain ? 'col-span-full md:col-span-2' : 'col-span-1'} group`;
    
    const handleDownload = () => {
        if (!shot.imageUrl) return;
        const link = document.createElement('a');
        link.href = shot.imageUrl;
        const fileName = `${String(shot.shot_number).padStart(2, '0')}_${shot.shot_type.replace(/ /g, '-')}.jpg`;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className={cardClasses}>
            <div className="relative aspect-w-1 aspect-h-1 w-full bg-gray-200 flex items-center justify-center">
                {shot.imageUrl ? (
                    <>
                        <img src={shot.imageUrl} alt={shot.shot_type} className="object-cover w-full h-full" />
                        <button
                            onClick={handleDownload}
                            className="absolute top-2 right-2 bg-black bg-opacity-50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-opacity-75 focus:opacity-100 focus:outline-none"
                            aria-label="Download image"
                        >
                            <DownloadIcon className="h-5 w-5" />
                        </button>
                    </>
                ) : (
                    <div className="p-4 text-center">
                        <Spinner className="mx-auto text-gray-400" />
                        <p className="text-sm text-gray-500 mt-2">Rendering...</p>
                    </div>
                )}
            </div>
            <div className="p-4 bg-gray-50">
                <p className="font-semibold text-gray-800">{shot.shot_type}</p>
                <p className="text-xs text-gray-500 mt-1 truncate">{shot.prompt}</p>
            </div>
        </div>
    );
};

export const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ sceneData, isLoading, loadingMessage, error, onReset }) => {
  const [isZipping, setIsZipping] = useState(false);

  const handleDownloadAll = async () => {
    if (!sceneData || isZipping) return;
    
    setIsZipping(true);
    try {
        const zip = new JSZip();
        const imagePromises = sceneData.shot_sequence
            .filter(shot => shot.imageUrl)
            .map(async (shot) => {
                const response = await fetch(shot.imageUrl!);
                const blob = await response.blob();
                const fileName = `${String(shot.shot_number).padStart(2, '0')}_${shot.shot_type.replace(/ /g, '-')}.jpg`;
                zip.file(fileName, blob);
            });
        
        await Promise.all(imagePromises);

        const content = await zip.generateAsync({ type: "blob" });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(content);
        link.download = `${sceneData.scene_id}.zip`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);

    } catch (err) {
        console.error("Error creating ZIP file:", err);
        // You might want to show an error to the user here
    } finally {
        setIsZipping(false);
    }
  };

  if (isLoading && !sceneData) {
    return (
      <div className="mt-8 text-center p-8 bg-white rounded-xl shadow-lg border border-gray-200">
        <div className="flex justify-center items-center text-gray-700">
            <Spinner className="mr-3" />
            <p className="text-lg font-medium">{loadingMessage}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-8">
        <div className="p-6 bg-red-50 border-l-4 border-red-400 rounded-r-lg">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-4 text-center">
            <button
                onClick={onReset}
                className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#002855] hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#002855]"
            >
                Start Over
            </button>
        </div>
      </div>
    );
  }

  if (!sceneData) {
    return null;
  }

  return (
    <div className="mt-8">
      {isLoading && loadingMessage && (
        <div className="mb-6 text-center p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex justify-center items-center text-blue-800">
              <Spinner className="mr-3" />
              <p className="text-md font-medium">{loadingMessage}</p>
          </div>
        </div>
      )}

      <div className="bg-white p-6 md:p-8 rounded-xl shadow-lg border border-gray-200">
        <div className="border-b border-gray-200 pb-5 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div>
                    <h2 className="text-xl font-bold text-gray-900 leading-tight">AI Product Specification</h2>
                    <p className="mt-1 text-sm text-gray-600 max-w-2xl">{sceneData.master_product_description}</p>
                    <p className="mt-2 text-xs text-gray-500 font-mono bg-gray-100 p-2 rounded">{sceneData.scene_id}</p>
                </div>
                <div className="flex-shrink-0 flex items-center gap-2 self-start sm:self-center">
                    <button
                        onClick={onReset}
                        className="px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#002855]"
                    >
                        Start New Scene
                    </button>
                    <button
                        onClick={handleDownloadAll}
                        disabled={isZipping}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#C8102E] hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:bg-gray-400"
                    >
                        {isZipping ? <Spinner className="mr-2"/> : <DownloadIcon className="mr-2 h-4 w-4"/>}
                        {isZipping ? 'Zipping...' : 'Download All as ZIP'}
                    </button>
                </div>
            </div>
             <div className="mt-4">
                <h3 className="text-lg font-semibold text-gray-800">Scene Description</h3>
                <p className="mt-1 text-sm text-gray-600">{sceneData.master_scene_description}</p>
            </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sceneData.shot_sequence.map((shot, index) => (
            <ImageCard key={shot.shot_number} shot={shot} isMain={index === 0} />
          ))}
        </div>
      </div>
    </div>
  );
};
