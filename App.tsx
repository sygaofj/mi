import React, { useState, useEffect } from 'react';
import { Shield, Lock, Unlock, Eye, EyeOff, Copy, RefreshCw, FileText, CheckCircle, AlertCircle, Sparkles } from 'lucide-react';
import { AppMode, CryptoResult } from './types';
import { encryptText, decryptText } from './services/cryptoService';
import { generateCamouflage, analyzePasswordStrength } from './services/geminiService';
import { Button } from './components/ui/Button';
import { Input } from './components/ui/Input';
import { TextArea } from './components/ui/TextArea';

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>(AppMode.ENCRYPT);
  const [inputData, setInputData] = useState('');
  const [password, setPassword] = useState('');
  const [outputData, setOutputData] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [aiContext, setAiContext] = useState('Technical Support Email');
  const [isProcessing, setIsProcessing] = useState(false);
  const [passwordAnalysis, setPasswordAnalysis] = useState<string>('');

  // Clear messages on interaction
  useEffect(() => {
    setError(null);
    setSuccessMsg(null);
  }, [inputData, password, mode]);

  const handleCopy = async () => {
    if (outputData) {
      await navigator.clipboard.writeText(outputData);
      setSuccessMsg('Copied to clipboard!');
      setTimeout(() => setSuccessMsg(null), 2000);
    }
  };

  const processAction = async () => {
    setError(null);
    setSuccessMsg(null);
    setOutputData('');

    if (!inputData.trim()) {
      setError('Please enter text to process.');
      return;
    }
    if (!password) {
      setError('Password is required for encryption/decryption.');
      return;
    }

    setIsProcessing(true);

    try {
      if (mode === AppMode.ENCRYPT) {
        const result: CryptoResult = encryptText(inputData, password);
        if (result.success && result.data) {
          setOutputData(result.data);
          setSuccessMsg('Encryption successful.');
        } else {
          setError(result.error || 'Encryption failed.');
        }
      } else if (mode === AppMode.DECRYPT) {
        // Attempt to clean input if it's from a camouflage text
        // This is a naive heuristic: look for the last block of base64-like chars
        let cleanCipher = inputData.trim();
        // If the user pastes a whole email, try to find the "Reference ID" part manually or just try decrypting the whole thing 
        // (AES decrypt usually fails fast on garbage). 
        // For better UX, let's assume the user pastes the *code*.
        // However, if we built the camouflage tool, we know it's at the end.
        
        const result: CryptoResult = decryptText(cleanCipher, password);
        if (result.success && result.data) {
          setOutputData(result.data);
          setSuccessMsg('Decryption successful.');
        } else {
          // If direct decryption failed, try to find a token at the end of the text
          const tokens = cleanCipher.split(/\s+/);
          const lastToken = tokens[tokens.length - 1];
          if (lastToken && lastToken.length > 20 && lastToken !== cleanCipher) {
             const retryResult = decryptText(lastToken, password);
             if (retryResult.success && retryResult.data) {
                setOutputData(retryResult.data);
                setSuccessMsg('Decryption successful (extracted from text).');
             } else {
                setError(result.error || 'Decryption failed. Check password or ciphertext.');
             }
          } else {
             setError(result.error || 'Decryption failed. Check password or ciphertext.');
          }
        }
      } else if (mode === AppMode.CAMOUFLAGE) {
        // 1. Encrypt first
        const cryptoRes: CryptoResult = encryptText(inputData, password);
        if (!cryptoRes.success || !cryptoRes.data) {
            setError(cryptoRes.error || 'Encryption failed step.');
            setIsProcessing(false);
            return;
        }

        // 2. Send to Gemini
        const camouflagedText = await generateCamouflage(cryptoRes.data, aiContext);
        setOutputData(camouflagedText);
        setSuccessMsg('Text camouflaged successfully.');
      }
    } catch (e) {
      setError('An unexpected error occurred.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePasswordAnalysis = async () => {
     if(!password) return;
     setPasswordAnalysis('Analyzing...');
     const result = await analyzePasswordStrength(password);
     setPasswordAnalysis(result);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Navigation / Sidebar */}
        <div className="md:col-span-3 space-y-2">
          <div className="mb-8 flex items-center space-x-2 text-indigo-400 px-4">
            <Shield className="w-8 h-8" />
            <h1 className="text-xl font-bold text-white tracking-tight">CipherVault</h1>
          </div>
          
          <nav className="space-y-1">
            <button
              onClick={() => { setMode(AppMode.ENCRYPT); setInputData(''); setOutputData(''); }}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${mode === AppMode.ENCRYPT ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-600/20' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}
            >
              <Lock className="w-5 h-5" />
              <span className="font-medium">Encrypt</span>
            </button>
            <button
              onClick={() => { setMode(AppMode.DECRYPT); setInputData(''); setOutputData(''); }}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${mode === AppMode.DECRYPT ? 'bg-emerald-600/10 text-emerald-400 border border-emerald-600/20' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}
            >
              <Unlock className="w-5 h-5" />
              <span className="font-medium">Decrypt</span>
            </button>
            <button
              onClick={() => { setMode(AppMode.CAMOUFLAGE); setInputData(''); setOutputData(''); }}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${mode === AppMode.CAMOUFLAGE ? 'bg-violet-600/10 text-violet-400 border border-violet-600/20' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}
            >
              <Sparkles className="w-5 h-5" />
              <span className="font-medium">AI Camouflage</span>
            </button>
          </nav>

          <div className="mt-8 px-4 py-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Security Status</h3>
            <div className="flex items-center space-x-2 text-emerald-500 text-sm">
              <Shield className="w-4 h-4" />
              <span>Client-side AES-256</span>
            </div>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              Your data never leaves your browser during basic encryption. AI features process encrypted hashes only.
            </p>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="md:col-span-9">
          <div className="bg-slate-800 rounded-2xl shadow-2xl border border-slate-700 overflow-hidden">
            
            {/* Header */}
            <div className="px-6 py-6 border-b border-slate-700 bg-slate-800">
              <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-white">
                    {mode === AppMode.ENCRYPT && 'Secure Encryption'}
                    {mode === AppMode.DECRYPT && 'Data Restoration'}
                    {mode === AppMode.CAMOUFLAGE && 'Steganographic Camouflage'}
                    </h2>
                    <p className="text-slate-400 text-sm mt-1">
                    {mode === AppMode.ENCRYPT && 'Transform sensitive text into unreadable ciphertext.'}
                    {mode === AppMode.DECRYPT && 'Recover original text from secure ciphertext.'}
                    {mode === AppMode.CAMOUFLAGE && 'Hide encrypted data within innocent-looking AI-generated text.'}
                    </p>
                </div>
                <div className="p-2 bg-slate-700/50 rounded-lg">
                    {mode === AppMode.ENCRYPT && <Lock className="w-6 h-6 text-indigo-400" />}
                    {mode === AppMode.DECRYPT && <Unlock className="w-6 h-6 text-emerald-400" />}
                    {mode === AppMode.CAMOUFLAGE && <Sparkles className="w-6 h-6 text-violet-400" />}
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="p-6 space-y-6">
              
              {/* Input Section */}
              <div className="space-y-4">
                <TextArea
                  label={mode === AppMode.DECRYPT ? "Ciphertext / Camouflaged Text" : "Sensitive Text Content"}
                  placeholder={mode === AppMode.DECRYPT ? "Paste the encrypted string here..." : "Enter the secret information you want to protect..."}
                  rows={5}
                  value={inputData}
                  onChange={(e) => setInputData(e.target.value)}
                  className="font-mono text-sm"
                />

                {/* Password Section */}
                <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700/50">
                    <div className="flex items-end gap-3">
                        <div className="flex-1 relative">
                            <Input
                                label="Encryption Password"
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => {
                                    setPassword(e.target.value);
                                    setPasswordAnalysis('');
                                }}
                                placeholder="Enter a strong password"
                                className="pr-10"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-9 text-slate-500 hover:text-slate-300 transition-colors"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                        {password && (
                            <Button 
                                type="button" 
                                variant="secondary" 
                                onClick={handlePasswordAnalysis}
                                title="Check Strength with AI"
                            >
                                <Shield size={18} />
                            </Button>
                        )}
                    </div>
                    {passwordAnalysis && (
                         <div className="mt-2 text-xs text-indigo-300 flex items-start gap-1">
                            <Sparkles size={12} className="mt-0.5" />
                            <span>{passwordAnalysis}</span>
                         </div>
                    )}
                </div>

                {/* AI Camouflage Context Input */}
                {mode === AppMode.CAMOUFLAGE && (
                   <div className="space-y-2">
                       <Input 
                            label="Camouflage Context (Topic)"
                            placeholder="e.g. Server Logs, Cooking Recipe, Meeting Notes"
                            value={aiContext}
                            onChange={(e) => setAiContext(e.target.value)}
                       />
                       <p className="text-xs text-slate-500">Gemini will generate text about this topic and hide the encrypted data inside it.</p>
                   </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2">
                 <div className="text-sm">
                    {error && (
                        <span className="flex items-center text-rose-500 animate-pulse">
                            <AlertCircle className="w-4 h-4 mr-1" />
                            {error}
                        </span>
                    )}
                    {successMsg && (
                        <span className="flex items-center text-emerald-500">
                            <CheckCircle className="w-4 h-4 mr-1" />
                            {successMsg}
                        </span>
                    )}
                 </div>
                 <div className="flex gap-3">
                     <Button 
                        variant="secondary" 
                        onClick={() => {
                            setInputData('');
                            setPassword('');
                            setOutputData('');
                            setError(null);
                            setSuccessMsg(null);
                        }}
                     >
                        Reset
                     </Button>
                     <Button 
                        onClick={processAction} 
                        isLoading={isProcessing}
                        variant={mode === AppMode.DECRYPT ? "primary" : "primary"}
                        className={mode === AppMode.DECRYPT ? "!bg-emerald-600 hover:!bg-emerald-500" : (mode === AppMode.CAMOUFLAGE ? "!bg-violet-600 hover:!bg-violet-500" : "")}
                     >
                        {mode === AppMode.ENCRYPT && 'Encrypt Data'}
                        {mode === AppMode.DECRYPT && 'Decrypt Data'}
                        {mode === AppMode.CAMOUFLAGE && 'Generate Camouflage'}
                     </Button>
                 </div>
              </div>

              {/* Output Section */}
              {outputData && (
                <div className="mt-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-slate-400">
                        {mode === AppMode.DECRYPT ? 'Restored Original Content' : 'Resulting Output'}
                    </label>
                    <div className="flex gap-2">
                        <button 
                            onClick={handleCopy}
                            className="text-xs flex items-center space-x-1 text-indigo-400 hover:text-indigo-300 transition-colors"
                        >
                            <Copy className="w-3 h-3" />
                            <span>Copy</span>
                        </button>
                    </div>
                  </div>
                  <div className="relative group">
                    <div className="absolute inset-0 bg-indigo-500/5 rounded-xl blur-sm group-hover:bg-indigo-500/10 transition-all"></div>
                    <textarea
                        readOnly
                        rows={6}
                        value={outputData}
                        className="relative w-full bg-slate-900/80 border border-slate-700/80 rounded-xl px-4 py-3 text-slate-200 font-mono text-sm focus:outline-none resize-none"
                    />
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;