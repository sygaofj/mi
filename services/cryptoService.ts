import CryptoJS from 'crypto-js';
import { CryptoResult } from '../types';

export const encryptText = (text: string, secretKey: string): CryptoResult => {
  try {
    if (!text || !secretKey) {
      return { success: false, error: '需要提供文本和密钥。' };
    }
    const ciphertext = CryptoJS.AES.encrypt(text, secretKey).toString();
    return { success: true, data: ciphertext };
  } catch (e) {
    return { success: false, error: '加密失败。' };
  }
};

export const decryptText = (ciphertext: string, secretKey: string): CryptoResult => {
  try {
    if (!ciphertext || !secretKey) {
      return { success: false, error: '需要提供密文和密钥。' };
    }
    const bytes = CryptoJS.AES.decrypt(ciphertext, secretKey);
    const originalText = bytes.toString(CryptoJS.enc.Utf8);
    
    if (!originalText) {
      return { success: false, error: '解密失败。密钥错误或数据已损坏。' };
    }
    
    return { success: true, data: originalText };
  } catch (e) {
    return { success: false, error: '密文格式无效。' };
  }
};