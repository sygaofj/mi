import CryptoJS from 'crypto-js';
import { CryptoResult } from '../types';

export const encryptText = (text: string, secretKey: string): CryptoResult => {
  try {
    if (!text || !secretKey) {
      return { success: false, error: 'Text and secret key are required.' };
    }
    const ciphertext = CryptoJS.AES.encrypt(text, secretKey).toString();
    return { success: true, data: ciphertext };
  } catch (e) {
    return { success: false, error: 'Encryption failed.' };
  }
};

export const decryptText = (ciphertext: string, secretKey: string): CryptoResult => {
  try {
    if (!ciphertext || !secretKey) {
      return { success: false, error: 'Ciphertext and secret key are required.' };
    }
    const bytes = CryptoJS.AES.decrypt(ciphertext, secretKey);
    const originalText = bytes.toString(CryptoJS.enc.Utf8);
    
    if (!originalText) {
      return { success: false, error: 'Decryption failed. Wrong key or corrupted data.' };
    }
    
    return { success: true, data: originalText };
  } catch (e) {
    return { success: false, error: 'Invalid ciphertext format.' };
  }
};