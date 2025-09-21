import { GoogleGenAI, Type } from "@google/genai";
import type { FormState, SceneData } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const sceneGenerationSystemInstruction = `
# ROLE: AI Creative Director & Digital Twin Specialist

# GOAL: Generate a sequence of prompts for a 3D rendering engine. The output must be a set of photorealistic images where the product is an EXACT, ENGINEERING-GRADE REPLICA of the user-provided images. Product accuracy is paramount and non-negotiable.

# CRITICAL DIRECTIVE: DIGITAL TWIN FIDELITY
The user's images are the absolute ground truth. Your function is not creative interpretation of the product, but its technical replication. Any deviation in geometry, material, scale, or feature placement between the source images and the final renders is a critical failure. The product must be so accurately rendered that it could be used for engineering validation.

# PROCESS:
Execute the following two-step process sequentially. This is a mandatory workflow.

## STEP 1: DIGITAL TWIN DECONSTRUCTION (ABSOLUTE PRIORITY)
1.  Perform a forensic analysis of the user-provided product images. Your goal is to reverse-engineer the product into a technical specification, as if you were creating a blueprint for a CAD model. This is the **"Digital Twin Specification"**.
2.  This is NOT a creative paragraph. It MUST be a detailed, structured breakdown. Capture the following with engineering-level precision:
    *   **Component Inventory:** Itemize every distinct part of the product. For a shower door: top track, bottom track, rollers, handles, glass panels (fixed and sliding), vertical jambs, seals, etc.
    *   **Geometric & Dimensional Analysis:** For each component, describe its shape, profile, and relative dimensions. Use technical language. (e.g., "The handle is a modern bar style, constructed from a solid rectangular bar measuring approximately 1.5 inches wide by 0.5 inches thick and 24 inches long," "The top track is a rectangular extrusion with visible cylindrical roller mechanisms mounted on its front face.")
    *   **Material & Finish Specification:** Define the exact material and surface finish. (e.g., "All metal components are aluminum with a micro-textured, matte black powder-coated finish," "The glass is perfectly clear, 3/8-inch (10mm) thick tempered glass with flat, polished edges.")
    *   **Assembly & Feature Placement:** Describe how components connect and where features are located. (e.g., "The sliding panel hangs from two visible, top-mounted rollers," "The handle is mounted horizontally, centered on the sliding panel.")
3.  This complete technical breakdown MUST be placed in the 'master_product_description' field of the JSON output.

## STEP 2: SCENE CONCEPTUALIZATION & PROMPT GENERATION
1.  After, and only after, completing the Digital Twin Specification, conceptualize a high-end environment based on the user's DESIRED_STYLE. Define this in the 'master_scene_description' field.
2.  Determine a logical sequence of 5-6 shots (wide lifestyle, medium angles, detail shots of specific components like handles, rollers, etc.).
3.  **MANDATORY PROMPT CONSTRUCTION RULE:** For **EVERY SINGLE SHOT** in the 'shot_sequence', the 'prompt' string **MUST** be constructed as follows:
    *   **START** with the complete, verbatim **"Digital Twin Specification"** you generated in STEP 1.
    *   **FOLLOW** it with the specific scene description, camera instructions (lens, angle, focus point), and lighting for that particular shot.
4.  This rule is the key to ensuring the image generator has the full, high-fidelity technical data for every single render, guaranteeing engineering-level consistency.

# EXAMPLE PROMPT FOR A SHOWER DOOR HANDLE:
"[Digital Twin Specification: The product is a bypass sliding shower door system. Component: Handle. Geometry: Solid rectangular bar, 1.5in x 0.5in profile, 24in length. Material: Aluminum. Finish: Matte black powder coat...] A photorealistic rendering of this shower door system in a modern bathroom. **Camera: 100mm macro lens, focused tightly on the rectangular bar handle, highlighting its sharp edges and matte texture. Shallow depth of field.**"

# OUTPUT FORMAT:
Provide the output STRICTLY as a JSON object for application integration, adhering to the provided schema.
`;


export const generateScenePrompts = async (formState: FormState): Promise<SceneData> => {
    const { productCategory, style, uploadedImages } = formState;

    const promptText = `
[INPUTS]
PRODUCT_CATEGORY: "${productCategory}"
DESIRED_STYLE: "${style}"

Based on the desired style and, MOST IMPORTANTLY, the provided product images, generate the scene prompts according to your core instructions. The product replica must be perfect.
`;

    const contentParts: any[] = [{ text: promptText }];
    
    if (uploadedImages && uploadedImages.length > 0) {
        uploadedImages.forEach(image => {
            contentParts.push({
                inlineData: {
                    mimeType: image.mimeType,
                    data: image.base64,
                }
            });
        });
    }

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: contentParts },
            config: {
                systemInstruction: sceneGenerationSystemInstruction,
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        scene_id: { type: Type.STRING },
                        master_scene_description: { type: Type.STRING },
                        master_product_description: { type: Type.STRING },
                        shot_sequence: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    shot_number: { type: Type.INTEGER },
                                    shot_type: { type: Type.STRING },
                                    prompt: { type: Type.STRING }
                                },
                                required: ["shot_number", "shot_type", "prompt"]
                            }
                        }
                    },
                    required: ["scene_id", "master_scene_description", "master_product_description", "shot_sequence"]
                }
            }
        });

        const jsonText = response.text.trim();
        return JSON.parse(jsonText);
    } catch (error) {
        console.error("Error generating scene prompts:", error);
        throw new Error("Failed to generate scene prompts from the AI. The model may have returned an invalid JSON structure. Please try again.");
    }
};

export const generateImageFromPrompt = async (prompt: string, shot_type: string): Promise<string> => {
    // Determine aspect ratio based on shot type. Lifestyle shots get a wider ratio.
    const isLifestyle = shot_type.toLowerCase().includes('lifestyle');
    const aspectRatio = isLifestyle ? '4:3' : '1:1';

    try {
        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: prompt,
            config: {
                numberOfImages: 1,
                outputMimeType: 'image/jpeg',
                aspectRatio: aspectRatio,
            },
        });

        if (response.generatedImages && response.generatedImages.length > 0) {
            return response.generatedImages[0].image.imageBytes;
        } else {
            throw new Error("No image was generated.");
        }
    } catch (error) {
        console.error("Error generating image:", error);
        throw new Error("Failed to generate an image. The model may have refused the prompt.");
    }
};
