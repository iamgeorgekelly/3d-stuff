export type ProductCategory = 
  | 'Alcove Tubs/Inset Tubs'
  | 'Backwall Kit'
  | 'Bathroom Sink'
  | 'Kitchen Sink Faucet'
  | 'Mirror/Cabinet'
  | 'Shower Curtain Rod'
  | 'Shower Door/Tub Door'
  | 'Shower Enclosures'
  | 'Shower Faucet'
  | 'Shower Kit'
  | 'Faucets'
  | 'Toilets'
  | 'Bathtub Kit'
  | 'Bathtubs'
  | 'Utility Sink'
  | 'Vanity'
  | 'Vanity Knob/Handles'
  | 'Vessel Sink'
  | 'Exposed Shower System'
  | 'Base';

export interface UploadedImage {
  base64: string;
  mimeType: string;
}

export interface FormState {
  productCategory: ProductCategory;
  style: string;
  uploadedImages: UploadedImage[];
}

export interface Shot {
  shot_number: number;
  shot_type: string;
  prompt: string;
  imageUrl?: string;
}

export interface SceneData {
  scene_id: string;
  master_scene_description: string;
  master_product_description: string;
  shot_sequence: Shot[];
}