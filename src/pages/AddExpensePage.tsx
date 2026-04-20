import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, storage } from '../firebase/config';
import { useAuth } from '../context/AuthContext';
import { scanReceipt } from '../services/geminiService';
import Layout from '../components/Layout';
import { Camera, X, Loader2, Save, ShoppingBag, Receipt } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { formatMonth } from '../lib/utils';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';

const CATEGORIES = [
  'Fuel / Transport', 'Food & Dining', 'Grocery', 'Health & Medical',
  'Education', 'Clothing', 'Entertainment', 'Utilities', 'Rent', 'Travel', 'Gifts', 'Custom'
];

export default function AddExpensePage() {
  const { familyId, user } = useAuth();
  const navigate = useNavigate();
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(CATEGORIES[1]);
  const [customCategory, setCustomCategory] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  
  const [isScanning, setIsScanning] = useState(false);
  const [scanningStatus, setScanningStatus] = useState('');
  const [receiptImage, setReceiptImage] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const startCamera = async () => {
    setShowCamera(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Camera error:", err);
      setShowCamera(false);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        const dataUrl = canvasRef.current.toDataURL('image/jpeg');
        setReceiptImage(dataUrl);
        stopCamera();
        processReceipt(dataUrl);
      }
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
    setShowCamera(false);
  };

  const processReceipt = async (base64: string) => {
    setIsScanning(true);
    setScanningStatus('Analyzing receipt with AI...');
    try {
      const data = await scanReceipt(base64.split(',')[1]);
      if (data.price) setAmount(data.price.toString());
      if (data.itemName) setDescription(data.itemName);
      setScanningStatus('Scan complete!');
      setTimeout(() => setIsScanning(false), 1500);
    } catch (err) {
      console.error(err);
      setIsScanning(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!familyId || !user) return;

    setScanningStatus('Saving expense...');
    setIsScanning(true);

    try {
      let receiptUrl = '';
      if (receiptImage) {
        const storageRef = ref(storage, `receipts/${familyId}/${Date.now()}.jpg`);
        await uploadString(storageRef, receiptImage, 'data_url');
        receiptUrl = await getDownloadURL(storageRef);
      }

      await addDoc(collection(db, 'families', familyId, 'expenses'), {
        memberId: user.uid,
        memberName: user.displayName || 'Member',
        amount: Number(amount),
        category: category === 'Custom' ? customCategory : category,
        description,
        date: new Date(date),
        month: formatMonth(new Date(date)),
        receiptImageUrl: receiptUrl,
        createdAt: serverTimestamp(),
      });

      navigate('/');
    } catch (err) {
      console.error(err);
      setIsScanning(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto space-y-6">
        <header className="border-b border-slate-200 pb-4">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Financial Entry</p>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800">Add New Expense</h1>
        </header>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Amount Card */}
          <div className="card-density text-center bg-slate-900 text-white border-none shadow-xl py-10">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Transaction Amount</label>
            <div className="flex items-center justify-center gap-2">
              <span className="text-4xl font-bold text-emerald-500">$</span>
              <input
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                autoFocus
                className="text-6xl font-bold tracking-tight w-full bg-transparent border-none text-center focus:ring-0 placeholder:text-slate-800"
                placeholder="0.00"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="card-density space-y-4">
              <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                <Receipt className="w-3 h-3" />
                Data Configuration
              </div>
              
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 ml-1 tracking-tighter">Category Assignment</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-sm text-sm font-medium focus:ring-1 focus:ring-slate-900 outline-none transition-all"
                >
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              {category === 'Custom' && (
                <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 ml-1 tracking-tighter">Custom Tag</label>
                  <input
                    type="text"
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-sm text-sm font-medium focus:ring-1 focus:ring-slate-900 outline-none transition-all"
                    placeholder="Label"
                    required
                  />
                </motion.div>
              )}

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 ml-1 tracking-tighter">Memo / Description</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-sm text-sm font-medium focus:ring-1 focus:ring-slate-900 outline-none transition-all"
                  placeholder="Notes"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 ml-1 tracking-tighter">Date of Event</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-sm text-sm font-medium focus:ring-1 focus:ring-slate-900 outline-none transition-all"
                  required
                />
              </div>
            </div>

            <div className="card-density flex flex-col items-center justify-center text-center gap-4 relative overflow-hidden">
              <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 self-start">
                <Camera className="w-3 h-3" />
                Evidence Capture
              </div>

              {receiptImage ? (
                <div className="relative w-full aspect-square border border-slate-100 overflow-hidden group">
                  <img src={receiptImage} alt="Receipt" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button 
                      type="button" 
                      onClick={() => setReceiptImage(null)}
                      className="p-3 bg-white text-red-600 shadow-lg hover:scale-110 transition-transform"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="w-full flex-1 flex flex-col items-center justify-center py-6 border-2 border-dashed border-slate-100">
                  <button
                    type="button"
                    onClick={startCamera}
                    className="w-12 h-12 bg-slate-50 text-slate-400 rounded-lg flex items-center justify-center hover:bg-slate-100 hover:text-slate-600 transition-all mb-3"
                  >
                    <Camera className="w-6 h-6" />
                  </button>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter px-4">Initialize OCR Scanner</p>
                </div>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={isScanning}
            className="w-full py-4 bg-emerald-600 text-white text-[12px] font-bold uppercase tracking-widest shadow-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-3"
          >
            {isScanning ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                {scanningStatus}
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Store Expense Record
              </>
            )}
          </button>
        </form>
      </div>

      {/* Camera Modal */}
      <AnimatePresence>
        {showCamera && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black flex flex-col"
          >
            <div className="p-4 flex items-center justify-between z-10">
              <button 
                onClick={stopCamera}
                className="p-3 bg-white/10 text-white rounded-full backdrop-blur-md"
              >
                <X className="w-6 h-6" />
              </button>
              <h3 className="text-white font-bold">Receipt Scanner</h3>
              <div className="w-12 h-12" />
            </div>

            <div className="flex-1 relative overflow-hidden flex items-center justify-center">
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                className="w-full h-full object-cover"
              />
              {/* Scan Guide UI */}
              <div className="absolute inset-8 border-2 border-white/30 rounded-3xl flex items-center justify-center pointer-events-none">
                 <div className="w-full h-[1px] bg-red-500/50 absolute animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.5)]" />
              </div>
            </div>

            <div className="p-12 flex items-center justify-center gap-8 bg-black">
              <button
                onClick={capturePhoto}
                className="w-20 h-20 bg-white rounded-full flex items-center justify-center p-1"
              >
                 <div className="w-full h-full rounded-full border-2 border-black" />
              </button>
            </div>
            
            <canvas ref={canvasRef} className="hidden" />
          </motion.div>
        )}
      </AnimatePresence>
    </Layout>
  );
}
