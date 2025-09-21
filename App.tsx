
import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { InputForm } from './components/InputForm';
import { ResultsDisplay } from './components/ResultsDisplay';
import type { FormState, SceneData, Shot } from './types';
import { generateScenePrompts, generateImageFromPrompt } from './services/geminiService';

const App: React.FC = () => {
  const [sceneData, setSceneData] = useState<SceneData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = useCallback(async (formState: FormState) => {
    setIsLoading(true);
    setError(null);
    setSceneData(null);
    setLoadingMessage('Step 1/2: Generating creative scene prompts...');

    try {
      // Step 1: Generate the scene prompts from Gemini
      const promptsData = await generateScenePrompts(formState);
      
      const initialShots: Shot[] = promptsData.shot_sequence.map(shot => ({ ...shot, imageUrl: undefined }));
      const initialSceneData: SceneData = { ...promptsData, shot_sequence: initialShots };
      setSceneData(initialSceneData);

      // Step 2: Generate images for each prompt
      const totalShots = initialShots.length;
      for (let i = 0; i < totalShots; i++) {
        setLoadingMessage(`Step 2/2: Rendering image ${i + 1} of ${totalShots}...`);
        
        const shot = initialShots[i];
        const base64Image = await generateImageFromPrompt(shot.prompt, shot.shot_type);
        const imageUrl = `data:image/jpeg;base64,${base64Image}`;
        
        setSceneData(prevData => {
            if (!prevData) return null;
            const updatedShots = [...prevData.shot_sequence];
            updatedShots[i] = { ...updatedShots[i], imageUrl };
            return { ...prevData, shot_sequence: updatedShots };
        });
      }

    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  }, []);

  const handleReset = useCallback(() => {
    setSceneData(null);
    setError(null);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
      <Header />
      <main className="container mx-auto p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          {!sceneData && !isLoading && !error && (
            <>
              <p className="text-center text-gray-600 mb-8">
                Define your product and desired style, and let our AI Creative Director generate a complete set of photorealistic lifestyle and product shots for you.
              </p>
              <InputForm onGenerate={handleGenerate} isLoading={isLoading} />
            </>
          )}
          <ResultsDisplay 
            sceneData={sceneData} 
            isLoading={isLoading} 
            loadingMessage={loadingMessage} 
            error={error} 
            onReset={handleReset}
          />
        </div>
      </main>
    </div>
  );
};

export default App;