export enum AppMode {
  ENCRYPT = 'ENCRYPT',
  DECRYPT = 'DECRYPT',
  CAMOUFLAGE = 'CAMOUFLAGE'
}

export interface CryptoResult {
  success: boolean;
  data?: string;
  error?: string;
}

export interface CamouflageRequest {
  encryptedData: string;
  context: string;
}