/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  Check, 
  Save, 
  X, 
  Calculator, 
  BookOpen, 
  DollarSign, 
  User, 
  ShieldAlert, 
  Image as ImageIcon,
  FileSpreadsheet,
  FileCheck2,
  RefreshCw,
  Sparkles,
  Signature
} from 'lucide-react';
import { Receipt, ReceiptItem, SchoolConfig, ProductPreset, UserRole } from '../types';
import { productPresets, calculateItemTotals, generateEtimeKeys } from '../data/presets';
import { ReceiptView } from './ReceiptView';
import { generateMpesaSvg, generateBankSlipSvg, generateChequeSlipSvg, generateUniformPriceListSlipSvg } from '../utils/receiptImages';

interface ReceiptFormProps {
  initialReceipt?: Receipt | null;
  schoolConfig: SchoolConfig;
  onSave: (receipt: Receipt) => void;
  onCancel: () => void;
  userRole: UserRole;
}

export const ReceiptForm: React.FC<ReceiptFormProps> = ({
  initialReceipt,
  schoolConfig,
  onSave,
  onCancel,
  userRole
}) => {
  // Mobile Layout Tab State
  const [activeWorkspaceTab, setActiveWorkspaceTab] = useState<'edit' | 'preview'>('edit');

  // --- AI IMAGE PARSER STATE ---
  const [isOcrLoading, setIsOcrLoading] = useState(false);
  const [ocrImage, setOcrImage] = useState<string | null>(null);
  const [ocrError, setOcrError] = useState<string | null>(null);
  const [ocrSuccess, setOcrSuccess] = useState<string | null>(null);
  const [ocrAppendMode, setOcrAppendMode] = useState<'append' | 'replace'>('append');

  // --- LOCAL RECEIPT STATE ---
  const [receipt, setReceipt] = useState<Receipt>(() => {
    if (initialReceipt) return { ...initialReceipt };

    // Standard starting state with pre-filled compliant mock references
    const rNo = `RA-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const keys = generateEtimeKeys(rNo);

    return {
      id: `rec-${Date.now()}`,
      receiptNo: rNo,
      invoiceNo: `INV-2026-${Math.floor(100 + Math.random() * 900)}`,
      refNo: `REF-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().split(' ')[0].substring(0, 5),
      academicYear: '2026',
      term: 'Term 2',
      studentName: '',
      admissionNo: '',
      studentClass: 'Grade 2 West',
      studentGrade: 'Grade 2',
      studentStream: 'West',
      parentName: '',
      parentPhone: '',
      parentEmail: '',
      paymentRef: '',
      paymentMode: 'M-Pesa',
      generatedBy: `${userRole} (Auto-Sign)`,
      items: [],
      subtotal: 0,
      discountTotal: 0,
      taxTotal: 0,
      grandTotal: 0,
      amountPaid: 0,
      balance: 0,
      kraPin: schoolConfig.kraPin,
      etimsInvoiceNo: `KRA20260613${Math.floor(100000 + Math.random() * 900000)}`,
      controlUnitNo: keys.cuNo,
      fiscalDeviceNo: keys.fdNo,
      receiptSignature: keys.sig,
      verificationCode: keys.vCode,
      invoiceHash: keys.hash,
      fiscalDayNo: 145,
      transactionId: `TXN-${Math.floor(1000 + Math.random() * 9000)}-KRA`,
      receiptUuid: keys.uuid,
      status: 'Paid',
      showStamp: true,
      bursarSignature: 'L. Wanjiku',
      accountantSignature: 'P. Kamau',
      principalSignature: 'Dr. S. Kinyua',
      showSignatures: true,
      schoolStampUrl: null
    };
  });

  // Track manual/quick student preset templates
  const studentPresetsList = [
    { name: "Ethan Kiprotich", adm: "RA/C/2024/1045", pName: "Robert Kiprotich", pPhone: "0712394857", pMail: "rkip@gmail.com", grade: "Grade 2", class: "Grade 2 East", stream: "East" },
    { name: "Muna Ibrahim", adm: "RA/C/2023/0948", pName: "Ibrahim Aden", pPhone: "0733847291", pMail: "ibra_a@yahoo.com", grade: "Grade 5", class: "Grade 5 North", stream: "North" },
    { name: "Angelina Wambui", adm: "RA/C/2025/1442", pName: "Grace Wambui", pPhone: "0722301928", pMail: "gwambui@outlook.com", grade: "Grade 2", class: "Grade 2 West", stream: "West" }
  ];

  // Recalculate calculations whenever items, discount details state change
  useEffect(() => {
    let sub = 0;
    let disc = 0;
    let taxVal = 0;

    receipt.items.forEach(itm => {
      sub += itm.quantity * itm.unitPrice;
      disc += itm.discount;
      taxVal += itm.taxAmount;
    });

    const grand = sub - disc + taxVal;
    const isPaid = receipt.status === 'Paid';
    const amountPaidVal = isPaid ? grand : receipt.amountPaid;
    const bal = grand - amountPaidVal;

    setReceipt(prev => ({
      ...prev,
      subtotal: Math.round(sub * 100) / 100,
      discountTotal: Math.round(disc * 100) / 100,
      taxTotal: Math.round(taxVal * 100) / 100,
      grandTotal: Math.round(grand * 100) / 100,
      amountPaid: Math.round(amountPaidVal * 100) / 100,
      balance: Math.max(0, Math.round(bal * 100) / 100)
    }));
  }, [receipt.items, receipt.status]);

  // Handle simple item fields modifications
  const updateItemField = (itemId: string, field: keyof ReceiptItem, val: any) => {
    setReceipt(prev => {
      const updatedItems = prev.items.map(itm => {
        if (itm.id !== itemId) return itm;

        const updated = { ...itm, [field]: val };

        // Auto compute standard math dependents
        if (field === 'quantity' || field === 'unitPrice' || field === 'discount' || field === 'taxRate') {
          const qty = field === 'quantity' ? Number(val) : itm.quantity;
          const uP = field === 'unitPrice' ? Number(val) : itm.unitPrice;
          const dC = field === 'discount' ? Number(val) : itm.discount;
          const tR = field === 'taxRate' ? Number(val) : itm.taxRate;
          
          const calculations = calculateItemTotals(qty, uP, dC, tR);
          updated.taxAmount = calculations.taxAmount;
          updated.total = calculations.total;
        }

        return updated;
      });

      return {
        ...prev,
        items: updatedItems
      };
    });
  };

  // Add individual empty custom receipt row
  const addCustomItemRow = () => {
    const newItem: ReceiptItem = {
      id: `itm-${Date.now()}`,
      description: '',
      category: 'Miscellaneous',
      quantity: 1,
      unitPrice: 0,
      discount: 0,
      taxRate: 16,
      taxType: 'A',
      taxAmount: 0,
      total: 0
    };
    setReceipt(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }));
  };

  // Add catalog product preset row with active variables
  const addCatalogProductRow = (prod: ProductPreset) => {
    // 16% VAT standard for Uniforms/Books (depending on options) or educational services exempt (0%)
    const defaultTax = prod.category === 'School Fees' ? 0 : 16;
    const defaultTaxType = defaultTax === 0 ? 'D' : 'A';
    
    const calculations = calculateItemTotals(1, prod.unitPrice, 0, defaultTax);

    const newItem: ReceiptItem = {
      id: `itm-${Date.now()}-${prod.id}`,
      description: prod.description,
      category: prod.category,
      quantity: 1,
      unitPrice: prod.unitPrice,
      discount: 0,
      taxRate: defaultTax,
      taxType: defaultTaxType,
      taxAmount: calculations.taxAmount,
      total: calculations.total
    };

    setReceipt(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }));
    
    // Switch to preview view panel in mobile screen tab to visualize immediately
    if (window.innerWidth < 768) {
      setActiveWorkspaceTab('preview');
    }
  };

  // Remove specific receipt item row
  const removeReceiptRow = (id: string) => {
    setReceipt(prev => ({
      ...prev,
      items: prev.items.filter(itm => itm.id !== id)
    }));
  };

  const syncCompliantCodes = () => {
    const keys = generateEtimeKeys(receipt.receiptNo);
    setReceipt(prev => ({
      ...prev,
      controlUnitNo: keys.cuNo,
      fiscalDeviceNo: keys.fdNo,
      receiptSignature: keys.sig,
      invoiceHash: keys.hash,
      verificationCode: keys.vCode,
      receiptUuid: keys.uuid
    }));
  };

  const handleApplyStudentPreset = (p: typeof studentPresetsList[0]) => {
    setReceipt(prev => ({
      ...prev,
      studentName: p.name,
      admissionNo: p.adm,
      studentGrade: p.grade,
      studentClass: p.class,
      studentStream: p.stream,
      parentName: p.pName,
      parentPhone: p.pPhone,
      parentEmail: p.pMail
    }));
  };

  const handleParseItemsImage = async () => {
    if (!ocrImage) {
      setOcrError("Please upload or choose an image first.");
      return;
    }
    
    setIsOcrLoading(true);
    setOcrError(null);
    setOcrSuccess(null);
    
    try {
      const response = await fetch("/api/parse-items-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ image: ocrImage }),
      });
      
      if (!response.ok) {
        const errJson = await response.json();
        throw new Error(errJson.error || "Failed to parse items from image.");
      }
      
      const data = await response.json();
      
      if (!data.items || !Array.isArray(data.items)) {
        throw new Error("Invalid output format returned by Gemini.");
      }
      
      if (data.items.length === 0) {
        throw new Error("No visible items could be recognized from the image.");
      }
      
      const parsedItems: ReceiptItem[] = data.items.map((itm: any, idx: number) => {
        const defaultTax = itm.category === 'School Fees' ? 0 : 16;
        const defaultTaxType = defaultTax === 0 ? 'D' : 'A';
        const qty = Number(itm.quantity) || 1;
        const price = Number(itm.unitPrice) || 0;
        
        const calc = calculateItemTotals(qty, price, 0, defaultTax);
        
        return {
          id: `itm-ocr-${Date.now()}-${idx}-${Math.floor(Math.random() * 1000)}`,
          description: itm.description || "Extracted Item",
          category: itm.category || "Miscellaneous",
          quantity: qty,
          unitPrice: price,
          discount: 0,
          taxRate: defaultTax,
          taxType: defaultTaxType,
          taxAmount: calc.taxAmount,
          total: calc.total
        };
      });
      
      setReceipt(prev => {
        const updatedItems = ocrAppendMode === 'replace' 
          ? parsedItems 
          : [...prev.items, ...parsedItems];
        return {
          ...prev,
          items: updatedItems
        };
      });
      
      setOcrSuccess(`Successfully extracted & injected ${parsedItems.length} items with complete quantities and prices!`);
      
      // Move to mobile preview if screen is small
      if (window.innerWidth < 768) {
        setActiveWorkspaceTab('preview');
      }
      
    } catch (err: any) {
      console.error(err);
      setOcrError(err.message || "An unexpected error occurred during extraction.");
    } finally {
      setIsOcrLoading(false);
    }
  };

  const handleSaveWorkspace = () => {
    if (!receipt.studentName) {
      alert("Please fill in the Student Name");
      return;
    }
    if (!receipt.admissionNo) {
      alert("Please fill in the Admission Number");
      return;
    }
    if (receipt.items.length === 0) {
      alert("Please add at least one billed item");
      return;
    }
    onSave(receipt);
  };

  return (
    <div className="space-y-6">
      
      {/* Upper Navigation & Save controller header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary-50 rounded-xl text-primary-600">
            <Calculator className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-display font-semibold text-gray-900">
              {initialReceipt ? "Modify Compliant Invoice" : "Generate Kenya eTIMS Receipt"}
            </h2>
            <p className="text-xs text-gray-500">
              Live updates with automatic VAT calculations and KRA control sequences.
            </p>
          </div>
        </div>

        {/* Workspace Mobile Tab Toggles */}
        <div className="flex md:hidden bg-gray-100 p-1 rounded-xl">
          <button 
            type="button" 
            onClick={() => setActiveWorkspaceTab('edit')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 ${
              activeWorkspaceTab === 'edit' ? 'bg-white shadow text-gray-900' : 'text-gray-500'
            }`}
          >
            ✍️ Edit Fields
          </button>
          <button 
            type="button" 
            onClick={() => setActiveWorkspaceTab('preview')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 ${
              activeWorkspaceTab === 'preview' ? 'bg-white shadow text-gray-900' : 'text-gray-500'
            }`}
          >
            📄 Live Paper Preview
          </button>
        </div>

        {/* Action controllers */}
        <div className="flex gap-2.5">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-xs font-semibold text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSaveWorkspace}
            className="px-4 py-2 text-xs font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-xl flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
          >
            <Save className="h-4 w-4" />
            Commit & Process
          </button>
        </div>
      </div>

      {/* --- WORKSPACE CORE GRID --- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Editor Pane (Left 7-columns) */}
        <div className={`space-y-6 lg:col-span-7 ${
          activeWorkspaceTab === 'edit' ? 'block' : 'hidden md:block'
        }`}>
          
          {/* Quick Select Student preset box */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2 mb-3">
              <Sparkles className="h-4 w-4 text-amber-500 animate-pulse" />
              Preload Student Presets (Rockside Academy)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {studentPresetsList.map((preset) => (
                <button
                  key={preset.adm}
                  type="button"
                  onClick={() => handleApplyStudentPreset(preset)}
                  className="px-3 py-2 text-left bg-gray-50 hover:bg-primary-50 border border-gray-100 hover:border-primary-100 rounded-xl transition-all group shrink-0 text-xs"
                >
                  <div className="font-semibold text-gray-900 group-hover:text-primary-700">
                    {preset.name}
                  </div>
                  <div className="text-[10px] text-gray-400 font-mono mt-0.5">
                    {preset.adm} ({preset.grade})
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-2 flex items-center gap-2">
              <User className="h-4 w-4 text-primary-500" />
              Student Profile Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                  Full Student Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Joy Muthoni"
                  value={receipt.studentName}
                  onChange={(e) => setReceipt(prev => ({ ...prev, studentName: e.target.value }))}
                  className="w-full text-xs px-3.5 py-2.5 bg-gray-50 rounded-xl border border-gray-200 focus:bg-white focus:outline-primary-500 focus:border-primary-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                  Admission Number *
                </label>
                <input
                  type="text"
                  placeholder="e.g. RA/C/2025/1210"
                  value={receipt.admissionNo}
                  onChange={(e) => setReceipt(prev => ({ ...prev, admissionNo: e.target.value }))}
                  className="w-full text-xs px-3.5 py-2.5 bg-gray-50 rounded-xl border border-gray-200 focus:bg-white focus:outline-primary-500 focus:border-primary-500 font-mono uppercase"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                  Grade Level
                </label>
                <select
                  value={receipt.studentGrade}
                  onChange={(e) => {
                    const gr = e.target.value;
                    setReceipt(prev => ({ 
                      ...prev, 
                      studentGrade: gr,
                      studentClass: prev.studentStream === 'N/A' ? gr : `${gr} ${prev.studentStream}`
                    }));
                  }}
                  className="w-full text-xs px-3 py-2 bg-gray-50 rounded-xl border border-gray-200 focus:bg-white"
                >
                  <option value="Grade 2">Grade 2</option>
                  <option value="Grade 5">Grade 5</option>
                  <option value="Grade 1">Grade 1</option>
                  <option value="Grade 3">Grade 3</option>
                  <option value="Grade 4">Grade 4</option>
                  <option value="Grade 6">Grade 6</option>
                  <option value="PP1">PP1</option>
                  <option value="PP2">PP2</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                  Stream
                </label>
                <select
                  value={receipt.studentStream}
                  onChange={(e) => {
                    const st = e.target.value;
                    setReceipt(prev => ({ 
                      ...prev, 
                      studentStream: st,
                      studentClass: st === 'N/A' ? prev.studentGrade : `${prev.studentGrade} ${st}`
                    }));
                  }}
                  className="w-full text-xs px-3 py-2 bg-gray-50 rounded-xl border border-gray-200 focus:bg-white"
                >
                  <option value="West">West</option>
                  <option value="East">East</option>
                  <option value="North">North</option>
                  <option value="South">South</option>
                  <option value="N/A">N/A</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                  Computed Class
                </label>
                <input
                  type="text"
                  disabled
                  value={receipt.studentClass}
                  className="w-full text-xs px-3.5 py-2.5 bg-gray-100 rounded-xl border border-gray-200 text-gray-500 font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                  Parent / Guardian Name
                </label>
                <input
                  type="text"
                  placeholder="Parent Full Name"
                  value={receipt.parentName}
                  onChange={(e) => setReceipt(prev => ({ ...prev, parentName: e.target.value }))}
                  className="w-full text-xs px-3 py-2 bg-gray-50 rounded-xl border border-gray-200 focus:bg-white"
                />
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                  Parent Phone
                </label>
                <input
                  type="text"
                  placeholder="+254 7..."
                  value={receipt.parentPhone}
                  onChange={(e) => setReceipt(prev => ({ ...prev, parentPhone: e.target.value }))}
                  className="w-full text-xs px-3 py-2 bg-gray-50 rounded-xl border border-gray-200 focus:bg-white font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                  Parent Email
                </label>
                <input
                  type="email"
                  placeholder="parent@domain.com"
                  value={receipt.parentEmail}
                  onChange={(e) => setReceipt(prev => ({ ...prev, parentEmail: e.target.value }))}
                  className="w-full text-xs px-3 py-2 bg-gray-50 rounded-xl border border-gray-200 focus:bg-white font-mono"
                />
              </div>
            </div>
          </div>

          {/* --- AI FEES & ITEM LIST PARSER CARD --- */}
          <div className="bg-gradient-to-br from-indigo-50 to-white border border-indigo-150 rounded-2xl p-6 shadow-sm space-y-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary-100/30 rounded-full blur-2xl pointer-events-none"></div>
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-indigo-100 pb-3">
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-gray-950 flex items-center gap-2">
                  <span className="p-1.5 bg-indigo-505 rounded-lg bg-indigo-600 text-white">
                    <Sparkles className="h-4 w-4" />
                  </span>
                  AI Itemized Price List Extractor
                </h3>
                <p className="text-[11px] text-gray-500 max-w-lg leading-normal">
                  Submit a photo/scan or handwritten paper representing uniforms, fee sheets, or books. Gemini will automatically extract, structure, and prefill your invoice table.
                </p>
              </div>
              <span className="self-start sm:self-center text-[10px] font-bold bg-primary-600 text-white px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
                <RefreshCw className="h-3 w-3 animate-spin" style={{ animationDuration: '3s' }} /> Gemini Core API
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-1">
              
              {/* Image Input Container */}
              <div className="space-y-3">
                <div 
                  className="border-2 border-dashed border-indigo-200 hover:border-indigo-400 rounded-xl p-5 bg-white text-center relative group min-h-[170px] flex flex-col justify-center items-center transition"
                >
                  <input 
                    type="file" 
                    id="feelist-uploader-input"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        const file = e.target.files[0];
                        const reader = new FileReader();
                        reader.onload = (loadEvent) => {
                          if (loadEvent.target?.result) {
                            setOcrImage(loadEvent.target?.result as string);
                            setOcrError(null);
                            setOcrSuccess(null);
                          }
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                  />

                  {ocrImage ? (
                    <div className="space-y-3 z-20 pointer-events-auto">
                      <div className="relative mx-auto max-w-[170px] border border-gray-200 rounded-lg bg-white p-1.5 shadow-md">
                        <img 
                          src={ocrImage} 
                          alt="Uniform slip preview" 
                          className="max-h-28 w-full object-contain rounded"
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setOcrImage(null);
                            setOcrSuccess(null);
                            setOcrError(null);
                          }}
                          className="absolute -top-2 -right-2 p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full transition shadow cursor-pointer"
                          title="Remove Image"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <p className="text-[10px] font-bold text-indigo-600">Selected List Image Ready</p>
                    </div>
                  ) : (
                    <div className="space-y-2 pointer-events-none">
                      <div className="p-3 bg-indigo-50 rounded-full inline-block text-indigo-500 group-hover:text-indigo-600 transition">
                        <ImageIcon className="h-6 w-6" />
                      </div>
                      <p className="text-[11px] font-bold text-gray-700 font-sans">Upload Item Slip or Fee Photo</p>
                      <span className="text-[10px] text-gray-400">Drag or click to choose from system files</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const slip = generateUniformPriceListSlipSvg();
                      setOcrImage(slip);
                      setOcrError(null);
                      setOcrSuccess(null);
                    }}
                    className="flex-1 py-2 px-3 bg-indigo-100 hover:bg-indigo-150 border border-indigo-200 text-indigo-800 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer font-sans"
                  >
                    💡 Load Demo Uniform Price Slip
                  </button>
                </div>
              </div>

              {/* Extraction Control Dashboard */}
              <div className="flex flex-col justify-between bg-white border border-indigo-50 rounded-xl p-4 space-y-4">
                <div className="space-y-3">
                  <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Extraction Settings</div>
                  
                  {/* Append vs Replace Option with custom buttons */}
                  <div className="space-y-2">
                    <label className="block text-[11px] text-gray-500 font-medium leading-tight">
                      When parsing finishes, what should we do with your active billed entries?
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setOcrAppendMode('append')}
                        className={`py-2 px-3 text-xs font-bold rounded-xl border transition cursor-pointer text-center font-sans ${
                          ocrAppendMode === 'append'
                            ? 'bg-indigo-50 border-indigo-300 text-indigo-900'
                            : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        ➕ Append to current lists
                      </button>
                      <button
                        type="button"
                        onClick={() => setOcrAppendMode('replace')}
                        className={`py-2 px-3 text-xs font-bold rounded-xl border transition cursor-pointer text-center font-sans ${
                          ocrAppendMode === 'replace'
                            ? 'bg-red-50 border-red-200 text-red-900'
                            : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        ⚠️ Overwrite active list
                      </button>
                    </div>
                  </div>

                  {ocrSuccess && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-[11px] font-semibold text-emerald-800 flex items-start gap-2 animate-fadeIn leading-relaxed">
                      <span className="shrink-0 text-base">✅</span>
                      <span>{ocrSuccess}</span>
                    </div>
                  )}

                  {ocrError && (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-[11px] font-semibold text-amber-800 flex items-start gap-2 leading-relaxed">
                      <span className="shrink-0 text-base">⚠️</span>
                      <span>{ocrError}</span>
                    </div>
                  )}
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    disabled={isOcrLoading || !ocrImage}
                    onClick={handleParseItemsImage}
                    className={`w-full py-3 px-4 font-bold rounded-xl transition flex items-center justify-center gap-2 text-sm shadow-md select-none font-sans ${
                      !ocrImage 
                        ? 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed'
                        : isOcrLoading
                          ? 'bg-indigo-600 text-white cursor-wait opacity-85'
                          : 'bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white shadow-indigo-200 cursor-pointer'
                    }`}
                  >
                    {isOcrLoading ? (
                      <>
                        <RefreshCw className="h-4.5 w-4.5 animate-spin" />
                        <span>AI Scanning and Extracting Items...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4.5 w-4.5" />
                        <span>Extract with Gemini AI (1-Click)</span>
                      </>
                    )}
                  </button>
                </div>

              </div>

            </div>
          </div>

          {/* --- FEE SCHEDULE & QUICK SELECT CATALOG --- */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-gray-100 pb-2">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-primary-500" />
                Rockside Academy Product Catalog
              </h3>
              <span className="text-[10px] font-semibold bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                1-Click Quick Add
              </span>
            </div>
            
            {/* Filter segments by school syllabus / requirements */}
            <div className="space-y-4">
              {/* Grade 2 Options Section */}
              <div>
                <h4 className="text-[11px] font-bold text-primary-900 tracking-wider uppercase mb-2 bg-gray-50 px-2 py-1 rounded">
                  🎒 Grade 2 (Preloaded Uniforms & Workbooks)
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {productPresets.filter(p => p.grade === 'Grade 2').map(prod => (
                    <button
                      key={prod.id}
                      type="button"
                      onClick={() => addCatalogProductRow(prod)}
                      className="px-2.5 py-1.5 bg-white hover:bg-primary-50 border border-gray-200 hover:border-primary-300 text-gray-700 hover:text-primary-800 rounded-lg text-xs font-medium transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="h-3 w-3 shrink-0" />
                      <span>{prod.description}</span>
                      <span className="text-gray-400 font-mono text-[10px] font-normal">({prod.unitPrice}/=)</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Grade 5 Options Section */}
              <div>
                <h4 className="text-[11px] font-bold text-primary-900 tracking-wider uppercase mb-2 bg-gray-50 px-2 py-1 rounded">
                  📚 Grade 5 (Preloaded Uniforms & Workbooks)
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {productPresets.filter(p => p.grade === 'Grade 5').map(prod => (
                    <button
                      key={prod.id}
                      type="button"
                      onClick={() => addCatalogProductRow(prod)}
                      className="px-2.5 py-1.5 bg-white hover:bg-primary-50 border border-gray-200 hover:border-primary-300 text-gray-700 hover:text-primary-800 rounded-lg text-xs font-medium transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="h-3 w-3 shrink-0" />
                      <span>{prod.description}</span>
                      <span className="text-gray-400 font-mono text-[10px] font-normal font-sans">({prod.unitPrice}/=)</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* General Tuition Fees Section */}
              <div>
                <h4 className="text-[11px] font-bold text-primary-900 tracking-wider uppercase mb-2 bg-gray-50 px-2 py-1 rounded">
                  🏫 General School Fees & Tuition Programs
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {productPresets.filter(p => p.grade === 'General').map(prod => (
                    <button
                      key={prod.id}
                      type="button"
                      onClick={() => addCatalogProductRow(prod)}
                      className="px-2.5 py-1.5 bg-white hover:bg-primary-50 border border-gray-200 hover:border-primary-300 text-gray-700 hover:text-primary-800 rounded-lg text-xs font-medium transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="h-3 w-3 shrink-0" />
                      <span>{prod.description}</span>
                      <span className="text-gray-400 font-mono text-[10px] font-sans">({prod.unitPrice}/=)</span>
                    </button>
                  ))}
                </div>
              </div>

            </div>
          </div>

          {/* --- BILLED ITEMS TABLE WORKSPACE --- */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-sm font-bold text-gray-900">Billed Invoice Entries</h3>
              <div className="flex items-center gap-2">
                {receipt.items.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm("Are you sure you want to remove all items from this receipt?")) {
                        setReceipt(prev => ({ ...prev, items: [] }));
                      }
                    }}
                    className="px-3 py-1.5 text-xs bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 rounded-xl flex items-center gap-1 cursor-pointer font-bold transition-all shadow-xs"
                  >
                    <Trash2 className="h-3.5 w-3.5 text-red-600" />
                    Delete All Items
                  </button>
                )}
                <button
                  type="button"
                  onClick={addCustomItemRow}
                  className="px-3 py-1.5 text-xs bg-gray-50 text-gray-700 hover:bg-gray-100 hover:text-gray-900 border border-gray-200 rounded-xl flex items-center gap-1 cursor-pointer font-semibold transition shadow-xs"
                >
                  <Plus className="h-3.5 w-3.5 text-primary-600" />
                  Add Custom Row
                </button>
              </div>
            </div>

            {receipt.items.length === 0 ? (
              <div className="py-8 text-center bg-gray-50 border border-dashed border-gray-200 rounded-2xl space-y-2">
                <FileSpreadsheet className="h-8 w-8 text-gray-300 mx-auto" />
                <p className="text-xs text-gray-500 font-medium">No items added to invoice statement yet</p>
                <p className="text-[11px] text-gray-400">Click a catalog product preset above or insert a custom row</p>
              </div>
            ) : (
              <div className="space-y-4">
                {receipt.items.map((itm, idx) => (
                  <div key={itm.id} className="p-4 bg-slate-50/55 border border-slate-200/60 rounded-xl space-y-3 relative group shadow-2xs hover:shadow-xs transition duration-150">
                    <div className="flex justify-between items-center bg-gray-100/70 border border-gray-200/50 rounded-xl px-3 py-1.5 mb-2">
                      <span className="text-xs font-bold text-gray-700 font-mono uppercase">
                        Line Entry #{idx + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeReceiptRow(itm.id)}
                        className="flex items-center gap-1.5 text-xs font-bold text-red-600 hover:text-red-700 hover:bg-red-50 px-2.5 py-1 rounded-lg transition-all cursor-pointer border border-transparent hover:border-red-200"
                        title="Remove this item entry from receipt"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Delete Item
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-1">
                      {/* Description */}
                      <div className="sm:col-span-6">
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Description</label>
                        <input
                          type="text"
                          placeholder="e.g. Maths Exercise Prep Books"
                          value={itm.description}
                          onChange={(e) => updateItemField(itm.id, 'description', e.target.value)}
                          className="w-full text-xs px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg"
                        />
                      </div>

                      {/* Category */}
                      <div className="sm:col-span-3">
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Category</label>
                        <select
                          value={itm.category}
                          onChange={(e) => updateItemField(itm.id, 'category', e.target.value)}
                          className="w-full text-xs px-2 py-1.5 bg-white border border-gray-200 rounded-lg"
                        >
                          <option value="School Fees">School Fees</option>
                          <option value="Uniforms">Uniforms</option>
                          <option value="Books">Books</option>
                          <option value="Transport">Transport</option>
                          <option value="Boarding">Boarding</option>
                          <option value="Activity Fee">Activity Fee</option>
                          <option value="Examination">Examination</option>
                          <option value="Miscellaneous">Miscellaneous</option>
                        </select>
                      </div>

                      {/* Tax code selector mapping eTIMS */}
                      <div className="sm:col-span-3">
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">KRA Tax Type</label>
                        <select
                          value={`${itm.taxRate}-${itm.taxType}`}
                          onChange={(e) => {
                            const [rate, type] = e.target.value.split('-');
                            setReceipt(prev => ({
                              ...prev,
                              items: prev.items.map(i => {
                                if (i.id !== itm.id) return i;
                                const calculations = calculateItemTotals(i.quantity, i.unitPrice, i.discount, Number(rate));
                                return {
                                  ...i,
                                  taxRate: Number(rate),
                                  taxType: type as any,
                                  taxAmount: calculations.taxAmount,
                                  total: calculations.total
                                };
                              })
                            }));
                          }}
                          className="w-full text-xs px-2 py-1.5 bg-white border border-gray-200 rounded-lg"
                        >
                          <option value="16-A">16% KRA VAT (Type A)</option>
                          <option value="0-D">TAX EXEMPT (Type D)</option>
                          <option value="0-C">0% ZERO-RATED (Type C)</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Qty</label>
                        <input
                          type="number"
                          min="1"
                          value={itm.quantity}
                          onChange={(e) => updateItemField(itm.id, 'quantity', Math.max(1, parseInt(e.target.value) || 0))}
                          className="w-full text-xs px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg font-mono text-center"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">KES Unit Price</label>
                        <input
                          type="number"
                          value={itm.unitPrice}
                          onChange={(e) => updateItemField(itm.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                          className="w-full text-xs px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg font-mono text-right"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">KES Discount</label>
                        <input
                          type="number"
                          min="0"
                          value={itm.discount}
                          onChange={(e) => updateItemField(itm.id, 'discount', Math.max(0, parseFloat(e.target.value) || 0))}
                          className="w-full text-xs px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg font-mono text-right"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 text-right">Computed Row Net</label>
                        <div className="font-mono text-xs font-semibold text-gray-900 text-right h-8 flex items-center justify-end px-1 border border-transparent">
                          KES {itm.total.toLocaleString()}
                          <span className="text-[9px] text-gray-400 font-normal ml-1">
                            (VAT: {itm.taxAmount})
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* --- TRANSACTION DISBURSEMENT DETAILS --- */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-2">
              Payment & Auditing
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                  Collection Status
                </label>
                <select
                  value={receipt.status}
                  onChange={(e) => setReceipt(prev => ({ ...prev, status: e.target.value as any }))}
                  className="w-full text-xs px-3 py-2.5 bg-gray-50 rounded-xl border border-gray-200 focus:bg-white"
                >
                  <option value="Paid">PAID & TAX COMPLIANT (Instant eTIMS Signature)</option>
                  <option value="Approved">APPROVED STATEMENT (Partial / Draft status)</option>
                  <option value="Pending">PENDING FEES (No active deposits yet)</option>
                  <option value="Cancelled">CANCELLED / VOID (Reverses eTIMS record)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                  Payment Mode Source
                </label>
                <select
                  value={receipt.paymentMode}
                  onChange={(e) => setReceipt(prev => ({ ...prev, paymentMode: e.target.value as any }))}
                  className="w-full text-xs px-3 py-2.5 bg-gray-50 rounded-xl border border-gray-200 focus:bg-white animate"
                >
                  <option value="M-Pesa">M-Pesa Ledger</option>
                  <option value="Bank Transfer">Co-operative Bank EFT</option>
                  <option value="Cash">Cash Payments Depot</option>
                  <option value="Cheque">Standard Bank Banker Cheque</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                  Academic Year
                </label>
                <select
                  value={receipt.academicYear}
                  onChange={(e) => setReceipt(prev => ({ ...prev, academicYear: e.target.value }))}
                  className="w-full text-xs px-3 py-2 bg-gray-50 rounded-xl border border-gray-200 focus:bg-white"
                >
                  <option value="2026">Academic Year 2026</option>
                  <option value="2027">Academic Year 2027</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                  Academic Term
                </label>
                <select
                  value={receipt.term}
                  onChange={(e) => setReceipt(prev => ({ ...prev, term: e.target.value }))}
                  className="w-full text-xs px-3 py-2 bg-gray-50 rounded-xl border border-gray-200 focus:bg-white"
                >
                  <option value="Term 1">Term 1 (Jan - Apr)</option>
                  <option value="Term 2">Term 2 (May - Aug)</option>
                  <option value="Term 3">Term 3 (Sep - Dec)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 font-mono">
                  M-Pesa / Bank Reference *
                </label>
                <input
                  type="text"
                  placeholder="e.g. MPESA: QHK82JD71Y"
                  value={receipt.paymentRef}
                  onChange={(e) => setReceipt(prev => ({ ...prev, paymentRef: e.target.value }))}
                  className="w-full text-xs px-3.5 py-2.5 bg-gray-50 rounded-xl border border-gray-200 focus:bg-white font-mono uppercase"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                  Audited By Reference
                </label>
                <input
                  type="text"
                  placeholder="Responsible User"
                  value={receipt.generatedBy}
                  onChange={(e) => setReceipt(prev => ({ ...prev, generatedBy: e.target.value }))}
                  className="w-full text-xs px-3.5 py-2.5 bg-gray-100 rounded-xl border border-gray-200 text-gray-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                  Receipt / Stamp Date
                </label>
                <input
                  type="date"
                  value={receipt.date}
                  onChange={(e) => setReceipt(prev => ({ ...prev, date: e.target.value }))}
                  className="w-full text-xs px-3.5 py-2.5 bg-gray-50 rounded-xl border border-gray-200 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 font-mono">
                  Receipt / Stamp Time
                </label>
                <input
                  type="time"
                  value={receipt.time}
                  onChange={(e) => setReceipt(prev => ({ ...prev, time: e.target.value }))}
                  className="w-full text-xs px-3.5 py-2.5 bg-gray-50 rounded-xl border border-gray-200 focus:bg-white font-mono"
                />
              </div>
            </div>

            {receipt.status !== 'Paid' && (
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                  Total Deposit Received (KES)
                </label>
                <input
                  type="number"
                  placeholder="Enter custom deposit"
                  value={receipt.amountPaid}
                  onChange={(e) => setReceipt(prev => ({ ...prev, amountPaid: parseFloat(e.target.value) || 0 }))}
                  className="w-full text-xs px-3.5 py-2.5 bg-gray-50 rounded-xl border border-gray-200 focus:bg-white font-mono focus:outline-primary-500"
                />
                <p className="text-[11px] text-gray-400 mt-1">Outstanding Balance (KES {receipt.balance}) recalculates automatically.</p>
              </div>
            )}
          </div>

          {/* --- PAYMENT SLIP EVIDENCE UPLOADER --- */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-2 flex items-center gap-1.5">
              <ImageIcon className="h-4 w-4 text-primary-500 shrink-0" />
              Payment Slip Evidence Upload
            </h3>

            {/* Drag & Drop Surface with Click to Browse */}
            <div 
              onDragOver={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              onDrop={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                  const file = e.dataTransfer.files[0];
                  if (file.type.startsWith('image/')) {
                    const reader = new FileReader();
                    reader.onload = (loadEvent) => {
                      if (loadEvent.target?.result) {
                        setReceipt(prev => ({
                          ...prev,
                          receiptImage: loadEvent.target?.result as string
                        }));
                      }
                    };
                    reader.readAsDataURL(file);
                  } else {
                    alert("Please upload an image file (PNG, JPG, WEBP, SVG)");
                  }
                }
              }}
              className="border-2 border-dashed border-gray-200 hover:border-primary-400 bg-gray-50/50 rounded-xl p-5 text-center cursor-pointer transition-all relative group"
            >
              <input 
                type="file" 
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    const file = e.target.files[0];
                    const reader = new FileReader();
                    reader.onload = (loadEvent) => {
                      if (loadEvent.target?.result) {
                        setReceipt(prev => ({
                          ...prev,
                          receiptImage: loadEvent.target?.result as string
                        }));
                      }
                    };
                    reader.readAsDataURL(file);
                  }
                }}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                id="receipt-file-input"
              />
              
              {receipt.receiptImage ? (
                <div className="space-y-2.5">
                  <div className="relative mx-auto max-w-[130px] border border-gray-200 rounded-lg bg-white p-1 shadow-sm">
                    <img 
                      src={receipt.receiptImage} 
                      alt="Payment Slip Preview" 
                      className="max-h-20 w-full object-contain rounded-md"
                      referrerPolicy="no-referrer"
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setReceipt(prev => ({ ...prev, receiptImage: undefined }));
                      }}
                      className="absolute -top-1.5 -right-1.5 p-1 bg-red-500 hover:bg-red-600 text-white rounded-full transition shadow cursor-pointer z-10"
                      title="Remove Attachment"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-800">Evidence Image Loaded</p>
                    <p className="text-[10px] text-gray-400">Drag a different image or click here to replace it</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-2 pointer-events-none">
                  <div className="p-2 bg-gray-100 rounded-full inline-block text-gray-400 group-hover:text-primary-500 group-hover:bg-primary-50 transition-colors">
                    <ImageIcon className="h-5.5 w-5.5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-700">Drag & Drop Bank Slip / M-Pesa Screenshot</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">Supports PNG, JPG, WEBP formats up to 5MB</p>
                  </div>
                  <span className="inline-block text-[10px] font-semibold text-primary-600 bg-primary-50 px-2.5 py-0.5 rounded-full mt-1 group-hover:bg-primary-100 transition-colors">
                    or click to browse files
                  </span>
                </div>
              )}
            </div>

            {/* Quick Attach presets mock generator */}
            <div className="space-y-2">
              <label className="block text-[10.5px] font-bold text-gray-400 uppercase tracking-wider">
                🔬 Simulated Kenyan Payment Mockups
              </label>
              <p className="text-[10px] text-gray-400 leading-normal">
                No real payment slip on your device? Attach a beautifully synchronized mock payment voucher matching your current inputs (Student name, Total KES, Transaction code) in 1-click:
              </p>
              
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const val = generateMpesaSvg(
                      receipt.grandTotal,
                      receipt.paymentRef,
                      receipt.studentName,
                      receipt.date
                    );
                    setReceipt(prev => ({ ...prev, receiptImage: val }));
                  }}
                  className="px-2 py-2 bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-100 rounded-xl text-left text-xs transition duration-150 cursor-pointer group flex flex-col justify-between"
                >
                  <span className="font-bold text-emerald-800 group-hover:text-emerald-950">M-Pesa Slip</span>
                  <span className="text-[9px] text-emerald-500 mt-1 font-mono">Lipa na M-Pesa</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const val = generateBankSlipSvg(
                      receipt.grandTotal,
                      receipt.paymentRef,
                      receipt.studentName,
                      receipt.date
                    );
                    setReceipt(prev => ({ ...prev, receiptImage: val }));
                  }}
                  className="px-2 py-2 bg-blue-50 hover:bg-blue-100/80 border border-blue-100 rounded-xl text-left text-xs transition duration-150 cursor-pointer group flex flex-col justify-between"
                >
                  <span className="font-bold text-blue-800 group-hover:text-blue-950">Co-op Slip</span>
                  <span className="text-[9px] text-blue-500 mt-1 font-mono">Bank Deposit</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const val = generateChequeSlipSvg(
                      receipt.grandTotal,
                      receipt.paymentRef,
                      receipt.studentName,
                      receipt.date
                    );
                    setReceipt(prev => ({ ...prev, receiptImage: val }));
                  }}
                  className="px-2 py-2 bg-amber-50 hover:bg-amber-100/80 border border-amber-100 rounded-xl text-left text-xs transition duration-150 cursor-pointer group flex flex-col justify-between"
                >
                  <span className="font-bold text-amber-800 group-hover:text-amber-950">Equity Cheque</span>
                  <span className="text-[9px] text-amber-500 mt-1 font-mono">Banker's Cheque</span>
                </button>
              </div>
            </div>
          </div>

          {/* --- KRA eTIMS CRYPTOGRAPHIC OVERRIDES --- */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-gray-100 pb-2">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-emerald-600" />
                KRA eTIMS Cryptographic Overrides
              </h3>
              <button
                type="button"
                onClick={syncCompliantCodes}
                className="text-xs text-primary-600 font-semibold flex items-center gap-1 cursor-pointer hover:text-primary-700"
              >
                <RefreshCw className="h-3.5 w-3.5 shrink-0" />
                Regenerate Hashes
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 font-mono">
                  Control Unit No (CU)
                </label>
                <input
                  type="text"
                  value={receipt.controlUnitNo}
                  onChange={(e) => setReceipt(prev => ({ ...prev, controlUnitNo: e.target.value }))}
                  className="w-full text-xs px-3 py-2 bg-gray-50 rounded-xl border border-gray-200 focus:bg-white font-mono uppercase"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 font-mono">
                  Fiscal Device No (FD)
                </label>
                <input
                  type="text"
                  value={receipt.fiscalDeviceNo}
                  onChange={(e) => setReceipt(prev => ({ ...prev, fiscalDeviceNo: e.target.value }))}
                  className="w-full text-xs px-3 py-2 bg-gray-50 rounded-xl border border-gray-200 focus:bg-white font-mono uppercase"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 font-mono">
                  Receipt Signature (KRA SIG)
                </label>
                <input
                  type="text"
                  value={receipt.receiptSignature}
                  onChange={(e) => setReceipt(prev => ({ ...prev, receiptSignature: e.target.value }))}
                  className="w-full text-xs px-3 py-2 bg-gray-50 rounded-xl border border-gray-200 focus:bg-white font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 font-mono">
                  Verification PIN (vCode)
                </label>
                <input
                  type="text"
                  value={receipt.verificationCode}
                  onChange={(e) => setReceipt(prev => ({ ...prev, verificationCode: e.target.value }))}
                  className="w-full text-xs px-3 py-2 bg-gray-50 rounded-xl border border-gray-200 focus:bg-white font-mono uppercase"
                />
              </div>
            </div>
          </div>

          {/* --- DIGITAL SIGNATURES SETUP --- */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-2 flex items-center gap-2">
              <Signature className="h-4 w-4 text-primary-500" />
              Administrative Stamp & Signatures
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <label className="flex items-center gap-2.5 p-3 bg-gray-50 border border-gray-200 rounded-xl cursor-pointer">
                <input 
                  type="checkbox"
                  checked={receipt.showStamp}
                  onChange={(e) => setReceipt(prev => ({ ...prev, showStamp: e.target.checked }))}
                  className="rounded text-primary-600 h-4 w-4"
                />
                <span className="text-xs font-semibold text-gray-700">Affix Official Stamp</span>
              </label>

              <label className="flex items-center gap-2.5 p-3 bg-gray-50 border border-gray-200 rounded-xl cursor-pointer">
                <input 
                  type="checkbox"
                  checked={receipt.showSignatures}
                  onChange={(e) => setReceipt(prev => ({ ...prev, showSignatures: e.target.checked }))}
                  className="rounded text-primary-600 h-4 w-4"
                />
                <span className="text-xs font-semibold text-gray-700">Display Authorized Signatures</span>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Bursar Block Signature</label>
                <input
                  type="text"
                  value={receipt.bursarSignature || ''}
                  onChange={(e) => setReceipt(prev => ({ ...prev, bursarSignature: e.target.value }))}
                  placeholder="L. Wanjiku"
                  className="w-full text-xs px-3 py-2 bg-gray-50 rounded-xl border border-gray-200"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Accountant Signature</label>
                <input
                  type="text"
                  value={receipt.accountantSignature || ''}
                  onChange={(e) => setReceipt(prev => ({ ...prev, accountantSignature: e.target.value }))}
                  placeholder="P. Kamau"
                  className="w-full text-xs px-3 py-2 bg-gray-50 rounded-xl border border-gray-200"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Principal Approval</label>
                <input
                  type="text"
                  value={receipt.principalSignature || ''}
                  onChange={(e) => setReceipt(prev => ({ ...prev, principalSignature: e.target.value }))}
                  placeholder="Dr. S. Kinyua"
                  className="w-full text-xs px-3 py-2 bg-gray-50 rounded-xl border border-gray-200"
                />
              </div>
            </div>
          </div>

        </div>

        {/* Live A4 exact Paper Preview Panel (Right 5-columns) */}
        <div className={`space-y-4 lg:col-span-5 ${
          activeWorkspaceTab === 'preview' ? 'block' : 'hidden md:block'
        }`}>
          <div className="bg-gray-100 p-2.5 rounded-2xl border border-gray-200 max-h-[1400px] overflow-y-auto scroll-thin select-none">
            <div className="flex justify-between items-center px-2 pb-2">
              <span className="text-xs font-semibold text-primary-900 bg-primary-100/55 px-2 py-1 rounded-md flex items-center gap-1">
                <FileCheck2 className="h-3.5 w-3.5 text-primary-600 animate-bounce" />
                Live Fiscal Syncing (A4 Mode)
              </span>
              <span className="text-[10px] font-mono text-gray-400">Scaling: WYSWYG</span>
            </div>
            
            {/* Embedded Live Receipt Renderer */}
            <div className="bg-white rounded-xl shadow-md border border-gray-200 transform origin-top overflow-hidden">
              <ReceiptView receipt={receipt} schoolConfig={schoolConfig} isEmbedded={true} />
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
