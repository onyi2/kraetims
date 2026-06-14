/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Mail, 
  PhoneCall, 
  Trash2, 
  Edit, 
  Copy, 
  Eye, 
  Download, 
  Share2, 
  Printer, 
  Send,
  Sparkles,
  Info
} from 'lucide-react';
import { Receipt, UserRole, SchoolConfig } from '../types';
import { QRCodeSVG } from './QRCodeSVG';
import { motion, AnimatePresence } from 'motion/react';

interface ReceiptMiniThumbnailProps {
  receipt: Receipt;
  schoolConfig: SchoolConfig;
  coords: { x: number; y: number };
  onMouseEnterPopover: () => void;
  onMouseLeavePopover: () => void;
}

const ReceiptMiniThumbnail: React.FC<ReceiptMiniThumbnailProps> = ({
  receipt,
  schoolConfig,
  coords,
  onMouseEnterPopover,
  onMouseLeavePopover
}) => {
  const [activeTab, setActiveTab] = useState<'thermal' | 'a4'>('thermal');

  const formatKES = (val: number) => {
    return new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', maximumFractionDigits: 0 }).format(val);
  };

  const formatDateCompact = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      if (!isNaN(d.getTime())) {
        return d.toLocaleDateString('en-KE', { day: '2-digit', month: 'short', year: 'numeric' });
      }
    } catch(e){}
    return dateStr;
  };

  const cardHeight = 440;
  const topPosition = Math.min(coords.y - 120, window.innerHeight - cardHeight - 20);
  const leftPosition = Math.min(coords.x, window.innerWidth - 340);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 15 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 15 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      style={{ top: `${Math.max(20, topPosition)}px`, left: `${Math.max(20, leftPosition)}px` }}
      onMouseEnter={onMouseEnterPopover}
      onMouseLeave={onMouseLeavePopover}
      className="fixed w-[310px] bg-white rounded-2xl shadow-2xl border border-gray-200 z-[100] flex flex-col font-sans overflow-hidden select-none pointer-events-auto"
    >
      {/* Header with Switch Tabs */}
      <div className="bg-slate-900 text-white px-3.5 py-2.5 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-1.5">
          <Printer className="h-3.5 w-3.5 text-primary-400" />
          <span className="text-[10px] font-bold tracking-tight uppercase">Live Print Preview</span>
        </div>
        <div className="flex bg-slate-800 p-0.5 rounded-lg border border-slate-700">
          <button
            type="button"
            onClick={() => setActiveTab('thermal')}
            className={`text-[9px] font-bold px-2.5 py-0.5 rounded-md transition duration-150 ${
              activeTab === 'thermal' 
                ? 'bg-primary-600 text-white shadow font-extrabold' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Thermal
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('a4')}
            className={`text-[9px] font-bold px-2.5 py-0.5 rounded-md transition duration-150 ${
              activeTab === 'a4' 
                ? 'bg-primary-600 text-white shadow font-extrabold' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            A4 Page
          </button>
        </div>
      </div>

      {/* Main Preview Container */}
      <div className="p-3.5 bg-gray-50 flex-1 overflow-y-auto max-h-[380px] scroll-thin">
        {activeTab === 'thermal' ? (
          /* THERMAL MINI RECEIPT */
          <div className="bg-white border border-gray-300 p-4 shadow-xs font-mono text-[10px] text-gray-800 leading-normal rounded relative overflow-hidden">
            {/* Paper tear visual effect */}
            <div className="absolute top-0 left-0 right-0 h-[4px] bg-linear-to-b from-gray-200 to-transparent" />
            
            <div className="text-center font-bold text-[11px] tracking-tight uppercase text-gray-900">
              {schoolConfig.name || "KARONEY SUPPLIES"}
            </div>
            <div className="text-center text-[8px] text-gray-500 mt-0.5">
              {schoolConfig.address || "P.O. Box 4589-00100, Ruai, Nairobi"}
            </div>
            <div className="text-center text-[8px] text-gray-500">
              TEL: {schoolConfig.phone1}
            </div>
            <div className="text-center text-[8px] text-gray-500 font-bold mt-1">
              KRA PIN: {receipt.kraPin || "P000000000E"}
            </div>
            
            <div className="border-t border-dashed border-gray-300 my-2" />
            
            <div className="space-y-1 text-[9px] text-gray-600">
              <div className="flex justify-between">
                <span>RECEIPT: {receipt.receiptNo}</span>
                <span>DATE: {formatDateCompact(receipt.date)}</span>
              </div>
              <div className="flex justify-between">
                <span>TIME: {receipt.time}</span>
                <span className="text-right truncate max-w-[140px]">KRA PIN: {receipt.buyerPin || "N/A"}</span>
              </div>
              <div>BUYER: <span className="font-bold text-gray-850 uppercase">{receipt.buyerName || receipt.studentName || "General Buyer"}</span></div>
            </div>

            <div className="border-t border-dashed border-gray-300 my-2" />

            {/* mini listing header */}
            <div className="flex justify-between font-bold text-[8px] text-gray-500 mb-1">
              <span>ITEM DESCRIPTION</span>
              <span>TOTAL (KES)</span>
            </div>
            <div className="space-y-1 text-[9px]">
              {receipt.items.map((itm, idx) => (
                <div key={idx} className="flex justify-between items-start gap-2">
                  <span className="truncate max-w-[160px] text-gray-700">
                    {itm.quantity}x {itm.description}
                  </span>
                  <span className="font-bold text-gray-950 font-mono">
                    {formatKES(itm.total)}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-dashed border-gray-300 my-2" />

            {/* calculation totals block */}
            <div className="space-y-1 text-[9px] font-mono">
              <div className="flex justify-between">
                <span>TOTAL EXCL TAX:</span>
                <span>{formatKES(receipt.subtotal - (receipt.discountTotal || 0))}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>TOTAL VAT (16%):</span>
                <span>{formatKES(receipt.taxTotal)}</span>
              </div>
              <div className="flex justify-between font-bold text-gray-950 border-t border-dashed border-gray-300 pt-1 text-[11px]">
                <span>TOTAL AMOUNT:</span>
                <span>{formatKES(receipt.grandTotal)}</span>
              </div>
            </div>

            <div className="border-t border-dashed border-gray-300 my-2" />

            <div className="space-y-1 text-[8px] text-gray-500">
              <div>PAYMENT MODE: <span className="font-bold text-slate-800">{receipt.paymentMode.toUpperCase()}</span></div>
              {receipt.paymentRef && (
                <div>TX REF: <span className="font-bold text-slate-800">{receipt.paymentRef.toUpperCase()}</span></div>
              )}
            </div>

            {/* Mini QR verified area */}
            <div className="mt-3 flex flex-col items-center justify-center p-2 bg-slate-50 border border-dashed border-gray-200 rounded-lg">
              <QRCodeSVG value={receipt.verificationCode || "VERIFIED-E-INVOICE"} size={65} />
              <div className="text-[7px] text-gray-500 font-bold tracking-tight uppercase mt-1.5">
                END OF FISCAL RECEIPT
              </div>
            </div>
            
            <div className="text-[7px] text-gray-400 text-center mt-3 font-sans uppercase tracking-tight">
              KRA eTIMS ELECTRONIC TAX SYSTEM
            </div>
          </div>
        ) : (
          /* A4 INVOICE MINI PREVIEW */
          <div className="bg-white border border-gray-200 p-4 shadow-sm rounded-lg text-gray-800 relative flex flex-col border-t-3 border-t-primary-600">
            {/* Miniature Blue/Slate institutional receipt header */}
            <div className="flex justify-between items-start gap-2 border-b pb-2 mb-2">
              <div>
                <div className="font-bold text-[10px] text-gray-950 uppercase leading-none tracking-tight">
                  {schoolConfig.name || "KARONEY SCHOOL SUPPLIES"}
                </div>
                {schoolConfig.motto && (
                  <div className="text-[7px] text-gray-500 leading-none mt-1">
                    {schoolConfig.motto}
                  </div>
                )}
                <div className="text-[6.5px] text-gray-400 mt-1 pb-1">
                  {schoolConfig.address} • {schoolConfig.email}
                </div>
              </div>
              {/* Miniature emblem */}
              <div className="w-5 h-5 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-[8px] shrink-0 font-sans">
                R
              </div>
            </div>

            <div className="bg-primary-900 text-white rounded text-center py-0.5 text-[8px] font-bold tracking-widest uppercase mb-2">
              KRA ELECTRONIC TAX INVOICE
            </div>

            {/* metadata grid double column */}
            <div className="grid grid-cols-2 gap-2 text-[7px] text-gray-600 bg-gray-50 p-1.5 rounded mb-2 font-sans">
              <div className="space-y-0.5">
                <div><span className="font-bold text-gray-400 uppercase text-[6px]">Receipt:</span> <span className="font-mono text-gray-800 font-bold">{receipt.receiptNo}</span></div>
                <div><span className="font-bold text-gray-400 uppercase text-[6px]">Buyer Name:</span> <span className="text-gray-800 font-bold truncate max-w-[100px] inline-block align-bottom uppercase">{receipt.buyerName || receipt.studentName || "General Buyer"}</span></div>
                <div><span className="font-bold text-gray-400 uppercase text-[6px]">KRA PIN:</span> <span className="font-mono text-gray-800 font-semibold">{receipt.buyerPin || "N/A"}</span></div>
              </div>
              <div className="space-y-0.5 text-right">
                <div><span className="font-bold text-gray-400 uppercase text-[6px]">Date:</span> <span className="text-gray-800 font-semibold">{receipt.date}</span></div>
                <div><span className="font-bold text-gray-400 uppercase text-[6px]">Grade:</span> <span className="text-gray-800 font-semibold">{receipt.studentClass}</span></div>
                <div><span className="font-bold text-gray-400 uppercase text-[6px]">Term:</span> <span className="text-gray-800">{receipt.term}</span></div>
              </div>
            </div>

            {/* items table list */}
            <div className="border border-gray-200 rounded overflow-hidden mb-2">
              <div className="grid grid-cols-12 bg-gray-100 text-[6.5px] font-bold text-gray-500 py-1 px-1.5 uppercase tracking-wider border-b border-gray-100">
                <span className="col-span-8">Particular Fee Description</span>
                <span className="col-span-4 text-right">Credit (KES)</span>
              </div>
              <div className="divide-y divide-gray-100">
                {receipt.items.map((itm, idx) => (
                  <div key={idx} className="grid grid-cols-12 text-[7px] py-1 px-1.5 text-gray-700 font-medium">
                    <span className="col-span-8 truncate">{itm.description}</span>
                    <span className="col-span-4 text-right font-mono font-bold text-gray-900">{formatKES(itm.total)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* total calculations right alignment */}
            <div className="w-1/2 ml-auto space-y-0.5 text-[7px] border-t pt-1 font-sans">
              <div className="flex justify-between text-gray-500">
                <span>Subtotal:</span>
                <span className="font-mono">{formatKES(receipt.subtotal - (receipt.discountTotal || 0))}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>VAT (Exempt):</span>
                <span className="font-mono">{formatKES(receipt.taxTotal)}</span>
              </div>
              <div className="flex justify-between font-bold text-primary-950 border-t pt-0.5 text-[8.5px]">
                <span>Total Paid:</span>
                <span className="font-mono">{formatKES(receipt.grandTotal)}</span>
              </div>
            </div>

            {/* signatures and stamp simulation */}
            <div className="flex justify-between items-end mt-3 border-t border-dashed pt-2">
              <div className="text-[6px] text-gray-400 max-w-[120px] leading-tight">
                Issuer PIN: {receipt.kraPin || "P000000000E"}<br/>
                KRA Security module signed
              </div>
              {/* miniature compliance verification stamp */}
              <div className="w-10 h-10 border border-emerald-600 rounded-full flex flex-col items-center justify-center text-[5px] font-extrabold text-emerald-700 shrink-0 rotate-12 scale-95 opacity-85 font-sans leading-none">
                <span>VERIFIED</span>
                <span className="text-[4px] font-bold mt-0.5 text-emerald-600 uppercase">eTIMS OK</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Popover footer */}
      <div className="bg-slate-100 px-3.5 py-2 border-t border-gray-200 text-[9px] text-gray-500 flex items-center justify-between font-medium">
        <span className="flex items-center gap-1 font-sans">
          <Info className="h-3 w-3 text-slate-400" />
          Move mouse inside preview to select elements
        </span>
        <span className="text-primary-700 font-bold truncate max-w-[100px] font-mono">
          {receipt.receiptNo}
        </span>
      </div>
    </motion.div>
  );
};

interface ReceiptHistoryProps {
  receipts: Receipt[];
  onNavigate: (tab: string, receiptId?: string) => void;
  onDeleteReceipt: (id: string) => void;
  onDuplicateReceipt: (receipt: Receipt) => void;
  userRole: UserRole;
  schoolConfig?: SchoolConfig;
}

export const ReceiptHistory: React.FC<ReceiptHistoryProps> = ({
  receipts,
  onNavigate,
  onDeleteReceipt,
  onDuplicateReceipt,
  userRole,
  schoolConfig = {
    name: "KARONEY SUPPLIES",
    motto: "Quality Educational Aids and Excellence in Supplies",
    address: "P.O. Box 4589-00100, Ruai, Nairobi, Kenya",
    postalAddress: "4589-00100",
    phone1: "0794431355",
    phone2: "011458963",
    email: "info@karoneyschoolsupplies.co.ke",
    kraPin: "P051238491A",
    logoUrl: "",
    schoolStampUrl: ""
  }
}) => {
  // Search & Filter State variables
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGrade, setFilterGrade] = useState('All');
  const [filterMode, setFilterMode] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');

  // Hover Thumbnail states with advanced transition buffer tracking
  const [hoveredReceipt, setHoveredReceipt] = useState<Receipt | null>(null);
  const [hoverCoordinates, setHoverCoordinates] = useState<{ x: number; y: number } | null>(null);
  const hoverTimeoutRef = React.useRef<any>(null);

  const handleMouseEnterRow = (e: React.MouseEvent, rec: Receipt) => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    setHoveredReceipt(rec);
    setHoverCoordinates({
      x: rect.right - 8, // seamless cursor slide over
      y: rect.top,
    });
  };

  const handleMouseLeaveRow = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setHoveredReceipt(null);
      setHoverCoordinates(null);
    }, 250); // 250ms comfortable buffer
  };

  const handleMouseEnterPopover = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
  };

  const handleMouseLeavePopover = () => {
    setHoveredReceipt(null);
    setHoverCoordinates(null);
  };

  // Simulated Dispatch Overlay States
  const [activeDispatchReceipt, setActiveDispatchReceipt] = useState<Receipt | null>(null);
  const [dispatchType, setDispatchType] = useState<'email' | 'whatsapp' | null>(null);
  const [dispatchDestination, setDispatchDestination] = useState('');
  const [dispatchSubject, setDispatchSubject] = useState('');
  const [dispatchMessage, setDispatchMessage] = useState('');
  const [isDispatching, setIsDispatching] = useState(false);

  // Parse list of students grades for filtering dynamically
  const gradeLevels = ['All', 'Grade 2', 'Grade 5', 'PP1', 'PP2', 'Grade 1', 'Grade 3', 'Grade 4', 'Grade 6'];
  const paymentModes = ['All', 'M-Pesa', 'Bank Transfer', 'Cash', 'Cheque'];
  const etimsStatuses = ['All', 'Paid', 'Approved', 'Pending', 'Cancelled'];

  const formatKES = (val: number) => {
    return new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', maximumFractionDigits: 0 }).format(val);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-KE', {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  };

  // Filter receipt list
  const filteredReceipts = receipts.filter(rec => {
    const sTerm = searchTerm.toLowerCase();
    const matchesSearch = 
      (rec.studentName || '').toLowerCase().includes(sTerm) ||
      (rec.admissionNo || '').toLowerCase().includes(sTerm) ||
      (rec.buyerName || '').toLowerCase().includes(sTerm) ||
      (rec.buyerPin || '').toLowerCase().includes(sTerm) ||
      rec.receiptNo.toLowerCase().includes(sTerm) ||
      rec.invoiceNo.toLowerCase().includes(sTerm) ||
      rec.parentName.toLowerCase().includes(sTerm) ||
      rec.parentPhone.toLowerCase().includes(sTerm) ||
      (rec.paymentRef && rec.paymentRef.toLowerCase().includes(sTerm));

    const matchesGrade = filterGrade === 'All' || rec.studentGrade === filterGrade;
    const matchesMode = filterMode === 'All' || rec.paymentMode === filterMode;
    const matchesStatus = filterStatus === 'All' || rec.status === filterStatus;

    return matchesSearch && matchesGrade && matchesMode && matchesStatus;
  });

  const triggerDispatchModal = (rec: Receipt, type: 'email' | 'whatsapp') => {
    setActiveDispatchReceipt(rec);
    setDispatchType(type);
    
    if (type === 'email') {
      setDispatchDestination(rec.parentEmail || '');
      setDispatchSubject(`Official KRA eTIMS Receipt Statement: ${rec.receiptNo}`);
      setDispatchMessage(`Dear ${rec.parentName || 'Client'},\n\nPlease find attached the official KRA eTIMS-secure electronic receipt ${rec.receiptNo} representing funds captured for ${rec.buyerName || 'General Buyer'} (KRA PIN: ${rec.buyerPin || 'N/A'}) for ${rec.term}, ${rec.academicYear}.\n\nTotal Paid: ${formatKES(rec.grandTotal)}\nOutstanding Statement Balance: ${formatKES(rec.balance)}\n\nThank you for choosing Karoney Supplies.\n\nWarm regards,\nBilling Team`);
    } else {
      setDispatchDestination(rec.parentPhone || '');
      setDispatchMessage(`*KARONEY SUPPLIES OFFICIAL BILLING*\n\nHello ${rec.parentName || 'Client'},\nWe have compiled your digitally verified eTIMS invoice receipt *${rec.receiptNo}* for *${rec.buyerName || 'General Buyer'}*.\n\n*Term:* ${rec.term}\n*Total Fee Paid:* ${formatKES(rec.grandTotal)}\n*Control Unit ID:* ${rec.controlUnitNo}\n*KRA Verification PIN:* ${rec.verificationCode}\n\nDownload full statement PDF here: https://karoneysupplies.co.ke/receipts/${rec.id}`);
    }
  };

  const handleExecuteDispatch = (e: React.FormEvent) => {
    e.preventDefault();
    setIsDispatching(true);
    
    // Simulate API dispatch timeout
    setTimeout(() => {
      setIsDispatching(false);
      alert(`🎉 Successful! Digital statement successfully dispatched to ${dispatchDestination} via standard simulated ${dispatchType === 'email' ? 'Electronic Mail relay Node' : 'KRA SMS Gateway Gateway API'}.`);
      setActiveDispatchReceipt(null);
      setDispatchType(null);
    }, 1500);
  };

  const checkPrivilege = (role: UserRole, action: 'edit' | 'delete'): boolean => {
    if (action === 'edit') return ['Super Admin', 'Bursar', 'Accountant'].includes(role);
    if (action === 'delete') return ['Super Admin', 'Principal'].includes(role);
    return false;
  };

  return (
    <div className="space-y-6">
      
      {/* Title & Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <div>
          <h2 className="text-xl font-display font-bold text-gray-950">
            Secure Digital Receipts Archives
          </h2>
          <p className="text-xs text-gray-400 font-sans mt-0.5">
            Query, manage, audit, and dispatch pre-approved eTIMS transactional cash receipts.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-xs text-gray-400 uppercase font-bold tracking-wider font-sans">
              Filtered Receipts
            </div>
            <div className="text-xl font-display font-bold text-primary-700">
              {filteredReceipts.length} <span className="text-xs text-gray-500 font-normal">out of {receipts.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* SEARCH AND ADVANCED FILTERS GRID */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm space-y-4">
        
        {/* Core search string field */}
        <div className="relative">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search receipts by student, admission, parents, phone, receipt or invoice no..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-xs bg-gray-50 hover:bg-gray-100/50 border border-gray-200 rounded-xl focus:bg-white focus:outline-primary-500 focus:border-primary-500 font-medium"
          />
        </div>

        {/* Dropdown selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Grade filter */}
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1.5">
              Grade Level Filter
            </label>
            <div className="relative">
              <select
                value={filterGrade}
                onChange={(e) => setFilterGrade(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white"
              >
                {gradeLevels.map(gr => (
                  <option key={gr} value={gr}>{gr === 'All' ? 'All Grades' : gr}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Payment filter */}
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1.5">
              Payment Source
            </label>
            <div className="relative">
              <select
                value={filterMode}
                onChange={(e) => setFilterMode(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white"
              >
                {paymentModes.map(pm => (
                  <option key={pm} value={pm}>{pm === 'All' ? 'All Payment Instruments' : pm}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Status filter */}
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1.5">
              eTIMS Verification Status
            </label>
            <div className="relative">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:bg-white"
              >
                {etimsStatuses.map(st => (
                  <option key={st} value={st}>{st === 'All' ? 'All Tax Tethers' : st}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

      </div>

      {/* --- TABLE ARCHIVE LISTING --- */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        {filteredReceipts.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto text-gray-400">
              <Search className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-700">No school receipts matched your filters</p>
              <p className="text-xs text-gray-400">Clear search queries or reset selectors to view full archives</p>
            </div>
            <button
              onClick={() => { setSearchTerm(''); setFilterGrade('All'); setFilterMode('All'); setFilterStatus('All'); }}
              className="text-xs text-primary-600 hover:text-primary-700 font-semibold border border-primary-200 hover:bg-primary-50 px-3.5 py-1.5 rounded-xl transition cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto scroll-thin">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 text-xs text-gray-400 font-semibold uppercase tracking-wider bg-gray-50">
                  <th className="py-3.5 px-6">Invoice & Receipt Code</th>
                  <th className="py-3.5 px-4">Student Particulars</th>
                  <th className="py-3.5 px-4">Ledger Terms</th>
                  <th className="py-3.5 px-4">Billed Financials</th>
                  <th className="py-3.5 px-4 text-center">Sync Stat</th>
                  <th className="py-3.5 px-6 text-right">Operational Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {filteredReceipts.map((rec) => {
                  const itmCount = rec.items.length;
                  const isPaid = rec.status === 'Paid';
                  
                  return (
                    <tr key={rec.id} className="hover:bg-gray-50/70 transition-colors group">
                      
                      {/* Column 1: Codes & Dates (Interactive hover-tethered preview) */}
                      <td 
                        className="py-4 px-6 relative cursor-pointer select-none"
                        onMouseEnter={(e) => handleMouseEnterRow(e, rec)}
                        onMouseLeave={handleMouseLeaveRow}
                      >
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <div className="font-mono text-[13.5px] text-gray-950 font-bold tracking-tight">
                            {rec.receiptNo}
                          </div>
                          {/* Animated Sparkles Indicator on Row Hover */}
                          <span className="opacity-0 group-hover:opacity-100 transition-all duration-205 bg-primary-50 text-primary-700 text-[9px] font-bold px-1.5 py-0.5 rounded-md flex items-center gap-0.5 border border-primary-100 shadow-2xs font-sans">
                            <Sparkles className="h-2 w-2 text-primary-500 animate-pulse animate-duration-1000" />
                            Preview
                          </span>
                        </div>
                        <div className="text-[11px] text-primary-600 font-mono mt-0.5 font-semibold">
                          eTIMS Inv: #{rec.invoiceNo}
                        </div>
                        <div className="text-[10px] text-gray-400 mt-1 font-sans font-medium">
                          {formatDate(rec.date)} • {rec.time}
                        </div>
                      </td>

                      {/* Column 2: Buyer / Client */}
                      <td className="py-4 px-4 font-sans">
                        <div className="font-bold text-gray-800 tracking-tight uppercase">{rec.buyerName || rec.studentName || "General Buyer"}</div>
                        <div className="text-[11px] text-gray-500 font-mono mt-0.5">
                          KRA PIN: {rec.buyerPin || "N/A"}
                        </div>
                        <div className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded mt-1.5 inline-block font-sans font-medium">
                          {rec.studentClass}
                        </div>
                      </td>

                      {/* Column 3: Terms and Instruments */}
                      <td className="py-4 px-4">
                        <div className="font-semibold text-gray-700">{rec.term}</div>
                        <div className="text-gray-400 text-xs mt-0.5">Year {rec.academicYear}</div>
                        <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                          <span className="text-[10px] text-primary-700 font-bold">
                            💳 {rec.paymentMode}
                          </span>
                          {rec.receiptImage && (
                            <span 
                              className="text-[9px] font-semibold text-emerald-700 bg-emerald-50 px-1 py-0.2 rounded border border-emerald-100 flex items-center gap-0.5 pointer duration-150 hover:bg-emerald-100"
                              title="Payment slip thumbnail attachment loaded"
                            >
                              📎 Slip
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Column 4: Financial grand totals */}
                      <td className="py-4 px-4">
                        <div className="font-mono font-bold text-gray-900 text-xs">
                          {formatKES(rec.grandTotal)}
                        </div>
                        
                        <div className="flex items-center gap-1.5 mt-1 font-mono text-[10px]">
                          <span className="text-emerald-700 font-semibold" title="Paid/Deposited">
                            P: {formatKES(rec.amountPaid)}
                          </span>
                          <span className="text-gray-300">|</span>
                          <span className={`${rec.balance > 0 ? "text-amber-800 font-bold" : "text-gray-400"}`} title="Outstanding Balance">
                            B: {formatKES(rec.balance)}
                          </span>
                        </div>
                        <div className="text-[10px] text-gray-400 mt-1 font-sans">
                          {itmCount} entry line{itmCount === 1 ? '' : 's'}
                        </div>
                      </td>

                      {/* Column 5: KRA Verification compliant badging */}
                      <td className="py-4 px-4 text-center">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold rounded-full uppercase font-mono border ${
                          rec.status === 'Paid' 
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-100' 
                            : rec.status === 'Approved' 
                            ? 'bg-blue-50 text-blue-800 border-blue-100'
                            : rec.status === 'Cancelled'
                            ? 'bg-red-50 text-red-800 border-red-100'
                            : 'bg-amber-50 text-amber-800 border-amber-100'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            rec.status === 'Paid' ? 'bg-emerald-500' : rec.status === 'Approved' ? 'bg-blue-500' : rec.status === 'Cancelled' ? 'bg-red-500' : 'bg-amber-500'
                          }`}></span>
                          {rec.status}
                        </span>
                      </td>

                      {/* Column 6: Operational actions */}
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Isolated view print trigger */}
                          <button
                            onClick={() => onNavigate('builder', rec.id)}
                            title="Print / View Secure Invoice copy"
                            className="p-1 px-2 text-xs bg-gray-50 text-gray-600 hover:text-primary-700 hover:bg-primary-50 rounded-lg border border-gray-200 hover:border-primary-200 flex items-center gap-1 transition-all pointer cursor-pointer"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            View
                          </button>
                          
                          {/* Edit depending on role security bounds */}
                          {checkPrivilege(userRole, 'edit') ? (
                            <button
                              onClick={() => onNavigate('builder-edit', rec.id)}
                              title="Modify invoice payload fields"
                              className="p-1.5 text-gray-500 hover:text-emerald-700 hover:bg-gray-100 rounded-lg cursor-pointer"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                          ) : (
                            <span className="p-1.5 text-gray-300" title="Insufficient privileges">
                              —
                            </span>
                          )}

                          {/* Quick dispatch share toggle */}
                          <div className="relative group/share">
                            <button
                              type="button"
                              className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-gray-100 rounded-lg cursor-pointer flex items-center"
                            >
                              <Share2 className="h-4 w-4" />
                            </button>
                            
                            {/* Nested micro flyout drawer */}
                            <div className="hidden group-hover/share:flex absolute right-0 bottom-full bg-slate-900 text-white p-2 rounded-xl border border-slate-700 shadow-xl gap-1.5 z-40 mb-1.5">
                              <button
                                onClick={() => triggerDispatchModal(rec, 'email')}
                                className="px-2 py-1 bg-slate-800 hover:bg-primary-600 rounded text-[10px] font-semibold flex items-center gap-1 whitespace-nowrap cursor-pointer"
                              >
                                <Mail className="h-3 w-3" />
                                Email
                              </button>
                              <button
                                onClick={() => triggerDispatchModal(rec, 'whatsapp')}
                                className="px-2 py-1 bg-slate-800 hover:bg-emerald-600 rounded text-[10px] font-semibold flex items-center gap-1 whitespace-nowrap cursor-pointer"
                              >
                                <PhoneCall className="h-3 w-3" />
                                WhatsApp
                              </button>
                            </div>
                          </div>

                          <button
                            onClick={() => onDuplicateReceipt(rec)}
                            title="Duplicate receipt schema template"
                            className="p-1.5 text-gray-500 hover:text-amber-600 hover:bg-gray-100 rounded-lg cursor-pointer"
                          >
                            <Copy className="h-4 w-4" />
                          </button>

                          {checkPrivilege(userRole, 'delete') && (
                            <button
                              onClick={() => onDeleteReceipt(rec.id)}
                              title="Cancel or void transactional receipt"
                              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg cursor-pointer"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* --- EMAIL/WHATSAPP SIMULATED OVERLAY OVER DRAWER MODAL --- */}
      {activeDispatchReceipt && dispatchType && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl border border-gray-100 relative animate-in zoom-in-95 duration-150">
            <button
              onClick={() => { setActiveDispatchReceipt(null); setDispatchType(null); }}
              className="absolute top-4 right-4 p-1 rounded-lg text-gray-400 hover:text-gray-900 hover:bg-gray-100 cursor-pointer"
            >
              ✕
            </button>

            <div className="flex items-center gap-3 border-b pb-3 mb-4">
              <span className={`p-2.5 rounded-xl ${
                dispatchType === 'email' ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'
              }`}>
                {dispatchType === 'email' ? <Mail className="h-5 w-5" /> : <Send className="h-5 w-5" />}
              </span>
              <div>
                <h3 className="font-display font-semibold text-gray-900 text-md">
                  Send securely via {dispatchType === 'email' ? 'Electronic Mail' : 'SMS KRA Relay'}
                </h3>
                <p className="text-xs text-gray-500 font-sans">
                  Simulating Karoney School Supplies institutional outbound communications.
                </p>
              </div>
            </div>

            <form onSubmit={handleExecuteDispatch} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1.5">
                  Destination Address
                </label>
                <input
                  type="text"
                  required
                  value={dispatchDestination}
                  onChange={(e) => setDispatchDestination(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 bg-gray-50 rounded-xl border border-gray-200 font-mono"
                  placeholder={dispatchType === 'email' ? 'parent@gamil.com' : '+254 7...'}
                />
              </div>

              {dispatchType === 'email' && (
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1.5">
                    Subject Header
                  </label>
                  <input
                    type="text"
                    required
                    value={dispatchSubject}
                    onChange={(e) => setDispatchSubject(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 bg-gray-50 rounded-xl border border-gray-200 font-medium"
                  />
                </div>
              )}

              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1.5">
                  Message Content Summary
                </label>
                <textarea
                  required
                  rows={6}
                  value={dispatchMessage}
                  onChange={(e) => setDispatchMessage(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 bg-gray-50 rounded-xl border border-gray-200 font-sans whitespace-pre-wrap leading-relaxed"
                />
              </div>

              <div className="flex gap-2.5 justify-end pt-3 border-t">
                <button
                  type="button"
                  onClick={() => { setActiveDispatchReceipt(null); setDispatchType(null); }}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 rounded-xl bg-gray-50 border border-gray-200 hover:bg-gray-100 cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={isDispatching}
                  className={`px-5 py-2 text-xs font-bold text-white rounded-xl flex items-center gap-1.5 transition shadow-sm cursor-pointer ${
                    dispatchType === 'email' ? 'bg-primary-600 hover:bg-primary-700' : 'bg-emerald-600 hover:bg-emerald-700'
                  }`}
                >
                  {isDispatching ? (
                    <>
                      <span className="w-3 w-3 border-2 border-white/30 border-t-white animate-spin rounded-full inline-block"></span>
                      Transmitting Node...
                    </>
                  ) : (
                    <>
                      <Send className="h-3.5 w-3.5" />
                      Dispatch Statement
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* --- FLOATING MICROSCOPIC PRINT PREVIEW CARD --- */}
      <AnimatePresence>
        {hoveredReceipt && hoverCoordinates && (
          <ReceiptMiniThumbnail
            receipt={hoveredReceipt}
            schoolConfig={schoolConfig}
            coords={hoverCoordinates}
            onMouseEnterPopover={handleMouseEnterPopover}
            onMouseLeavePopover={handleMouseLeavePopover}
          />
        )}
      </AnimatePresence>

    </div>
  );
};
