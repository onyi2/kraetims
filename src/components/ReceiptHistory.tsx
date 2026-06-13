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
import { Receipt, UserRole } from '../types';

interface ReceiptHistoryProps {
  receipts: Receipt[];
  onNavigate: (tab: string, receiptId?: string) => void;
  onDeleteReceipt: (id: string) => void;
  onDuplicateReceipt: (receipt: Receipt) => void;
  userRole: UserRole;
}

export const ReceiptHistory: React.FC<ReceiptHistoryProps> = ({
  receipts,
  onNavigate,
  onDeleteReceipt,
  onDuplicateReceipt,
  userRole
}) => {
  // Search & Filter State variables
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGrade, setFilterGrade] = useState('All');
  const [filterMode, setFilterMode] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');

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
      rec.studentName.toLowerCase().includes(sTerm) ||
      rec.admissionNo.toLowerCase().includes(sTerm) ||
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
      setDispatchSubject(`Official KRA eTIMS School Receipt Statement: ${rec.receiptNo}`);
      setDispatchMessage(`Dear ${rec.parentName || 'Parent / Guardian'},\n\nPlease find attached the official KRA eTIMS-secure electronic receipt ${rec.receiptNo} for ${rec.studentName} (Admission No: ${rec.admissionNo}) representing funds captured for ${rec.term}, ${rec.academicYear}.\n\nTotal Paid: ${formatKES(rec.grandTotal)}\nOutstanding Statement Balance: ${formatKES(rec.balance)}\n\nThank you for choosing Rockside Academy.\n\nWarm regards,\nCash Office Billing Team`);
    } else {
      setDispatchDestination(rec.parentPhone || '');
      setDispatchMessage(`*ROCKSIDE ACADEMY OFFICIAL BILLING*\n\nHello ${rec.parentName || 'Parent'},\nWe have compiled your digitally verified eTIMS invoice receipt *${rec.receiptNo}* for student *${rec.studentName}*.\n\n*Term:* ${rec.term}\n*Total Fee Paid:* ${formatKES(rec.grandTotal)}\n*Control Unit ID:* ${rec.controlUnitNo}\n*KRA Verification PIN:* ${rec.verificationCode}\n\nDownload full statement PDF here: https://rocksideacademy.ac.ke/receipts/${rec.id}`);
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
                      
                      {/* Column 1: Codes \& Dates */}
                      <td className="py-4 px-6">
                        <div className="font-mono text-[13px] text-gray-900 font-bold">
                          {rec.receiptNo}
                        </div>
                        <div className="text-[11px] text-primary-600 font-mono mt-0.5 font-medium">
                          eTIMS Inv: #{rec.invoiceNo}
                        </div>
                        <div className="text-[10px] text-gray-400 mt-1">
                          {formatDate(rec.date)} • {rec.time}
                        </div>
                      </td>

                      {/* Column 2: Student */}
                      <td className="py-4 px-4">
                        <div className="font-bold text-gray-800 tracking-tight">{rec.studentName}</div>
                        <div className="text-[11px] text-gray-500 font-mono mt-0.5">
                          ADM: {rec.admissionNo}
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
                  Simulating Rockside Academy institutional outbound communications.
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

    </div>
  );
};
