/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  LayoutDashboard, 
  FilePlus, 
  History, 
  Settings, 
  ShieldCheck, 
  ChevronDown, 
  Sun, 
  Moon, 
  Compass, 
  Calculator,
  UserCheck,
  Award,
  BookOpen,
  Printer,
  X,
  CreditCard,
  Trash2,
  Lock,
  LockKeyhole,
  Upload,
  Image as ImageIcon
} from 'lucide-react';
import { Receipt, SchoolConfig, UserRole, AuditLog } from './types';
import { defaultSchoolConfig, getInitialMockReceipts, generateEtimeKeys } from './data/presets';
import { generateClassicOfficialStamp } from './utils/receiptImages';
import { Dashboard } from './components/Dashboard';
import { ReceiptForm } from './components/ReceiptForm';
import { ReceiptView } from './components/ReceiptView';
import { ReceiptHistory } from './components/ReceiptHistory';
import { PrintWindow } from './components/PrintWindow';
import { KaroneyLogo } from './components/KaroneyLogo';

export default function App() {
  // Navigation & Workspace State tethers
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedReceiptId, setSelectedReceiptId] = useState<string | null>(null);

  // Authentication & Security role states
  const [userRole, setUserRole] = useState<UserRole>('Super Admin');
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);

  // UI Theme Preset state: 'light' | 'dark' | 'deep-navy'
  const [visualTheme, setVisualTheme] = useState<'light' | 'dark' | 'deep-navy'>('light');

  // Core Persistent State
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [schoolConfig, setSchoolConfig] = useState<SchoolConfig>(defaultSchoolConfig);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  // Initialize and retrieve data on startup
  useEffect(() => {
    // 1. Fetch school metadata configuration
    const cachedConfig = localStorage.getItem('aistudio_school_config');
    if (cachedConfig) {
      const parsed = JSON.parse(cachedConfig);
      if (parsed && (!parsed.name || parsed.name.toUpperCase().includes("ROCKSIDE") || (parsed.address && (parsed.address.includes("3735") || parsed.address.toUpperCase().includes("3735"))))) {
        localStorage.setItem('aistudio_school_config', JSON.stringify(defaultSchoolConfig));
        setSchoolConfig(defaultSchoolConfig);
      } else {
        setSchoolConfig(parsed);
      }
    } else {
      localStorage.setItem('aistudio_school_config', JSON.stringify(defaultSchoolConfig));
      setSchoolConfig(defaultSchoolConfig);
    }

    // 2. Fetch receipts logs
    const cachedReceipts = localStorage.getItem('aistudio_school_receipts');
    if (cachedReceipts) {
      setReceipts(JSON.parse(cachedReceipts));
    } else {
      const initialMock = getInitialMockReceipts();
      localStorage.setItem('aistudio_school_receipts', JSON.stringify(initialMock));
      setReceipts(initialMock);
    }

    // 3. Sync Audit logs
    const cachedAudits = localStorage.getItem('aistudio_school_audits');
    if (cachedAudits) {
      setAuditLogs(JSON.parse(cachedAudits));
    } else {
      const initAudit: AuditLog = {
        id: `aud-${Date.now()}`,
        timestamp: new Date().toISOString(),
        role: 'Super Admin',
        userEmail: 'admin@karoneyschoolsupplies.co.ke',
        action: 'System Initialized',
        details: 'Preloaded KARONEY SCHOOL SUPPLIES default settings, books catalog & uniforms matrices. Setup KRA eTIMS cryptographic nodes.'
      };
      localStorage.setItem('aistudio_school_audits', JSON.stringify([initAudit]));
      setAuditLogs([initAudit]);
    }
  }, []);

  // Sync back to local storage whenever critical objects are transformed
  const saveToStorage = (updatedReceipts: Receipt[]) => {
    localStorage.setItem('aistudio_school_receipts', JSON.stringify(updatedReceipts));
    setReceipts(updatedReceipts);
  };

  const saveConfigToStorage = (updatedConfig: SchoolConfig) => {
    localStorage.setItem('aistudio_school_config', JSON.stringify(updatedConfig));
    setSchoolConfig(updatedConfig);
  };

  const appendAuditLog = (action: string, details: string, docNo?: string) => {
    const newLog: AuditLog = {
      id: `aud-${Date.now()}`,
      timestamp: new Date().toISOString(),
      role: userRole,
      userEmail: 'bursar.office@karoneyschoolsupplies.co.ke',
      action,
      details,
      receiptNo: docNo
    };
    const updatedAudits = [newLog, ...auditLogs];
    localStorage.setItem('aistudio_school_audits', JSON.stringify(updatedAudits));
    setAuditLogs(updatedAudits);
  };

  // --- CONTROLLER ACTIONS ---
  
  // Create / Save Receipt action
  const handleSaveReceipt = (updatedReceipt: Receipt) => {
    const exists = receipts.some(r => r.id === updatedReceipt.id);
    let newReceiptsList: Receipt[] = [];

    if (exists) {
      newReceiptsList = receipts.map(r => r.id === updatedReceipt.id ? updatedReceipt : r);
      appendAuditLog(
        'Receipt Modified', 
        `Updated billing statement for ${updatedReceipt.buyerName || updatedReceipt.studentName || 'Buyer'} (${updatedReceipt.studentClass}). Grand Total: KES ${updatedReceipt.grandTotal.toLocaleString()}`,
        updatedReceipt.receiptNo
      );
    } else {
      newReceiptsList = [updatedReceipt, ...receipts];
      appendAuditLog(
        'Receipt Created', 
        `Generated tax-compliant receipt for buyer ${updatedReceipt.buyerName || updatedReceipt.studentName || 'Buyer'} (${updatedReceipt.buyerPin || updatedReceipt.admissionNo || 'N/A'}). Amount paid: KES ${updatedReceipt.amountPaid.toLocaleString()}`,
        updatedReceipt.receiptNo
      );
    }

    saveToStorage(newReceiptsList);
    setActiveTab('dashboard');
  };

  // Delete/Cancel Transaction Receipt action
  const handleDeleteReceipt = (id: string) => {
    const recToDelete = receipts.find(r => r.id === id);
    if (!recToDelete) return;

    if (confirm(`⚠️ Extreme Notice: Are you sure you want to void/cancel Receipt ${recToDelete.receiptNo} for ${recToDelete.buyerName || recToDelete.studentName || 'Buyer'}?\nThis cancels the linked KRA tax billing statement.`)) {
      const updated = receipts.map(r => {
        if (r.id === id) {
          return { ...r, status: 'Cancelled' as const, balance: 0, amountPaid: 0 };
        }
        return r;
      });

      saveToStorage(updated);
      appendAuditLog(
        'Receipt Cancelled', 
        `Cancelled transaction receipt and reversed tax billing records on server databases for buyer ${recToDelete.buyerName || recToDelete.studentName || 'Buyer'}`,
        recToDelete.receiptNo
      );
      
      alert(`🎉 Receipt ${recToDelete.receiptNo} successfully marked CANCELLED/VOID. Balance has been adjusted.`);
    }
  };

  // Duplicate receipt to speed up multi-term entries
  const handleDuplicateReceipt = (original: Receipt) => {
    const newRNo = `RA-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const keys = generateEtimeKeys(newRNo);

    const duplicated: Receipt = {
      ...original,
      id: `rec-${Date.now()}`,
      receiptNo: newRNo,
      invoiceNo: `INV-2026-${Math.floor(100 + Math.random() * 900)}`,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().split(' ')[0].substring(0, 5),
      etimsInvoiceNo: `KRA20260613${Math.floor(100000 + Math.random() * 900000)}`,
      controlUnitNo: keys.cuNo,
      fiscalDeviceNo: keys.fdNo,
      receiptSignature: keys.sig,
      invoiceHash: keys.hash,
      verificationCode: keys.vCode,
      receiptUuid: keys.uuid,
      status: 'Paid',
      amountPaid: original.grandTotal,
      balance: 0
    };

    const newReceiptsList = [duplicated, ...receipts];
    saveToStorage(newReceiptsList);
    appendAuditLog(
      'Receipt Duplicated', 
      `Duplicated previous ledger parameters for buyer ${original.buyerName || original.studentName || 'Buyer'} into new compliant receipt ${newRNo}`,
      newRNo
    );

    alert(`🎉 Successfully cloned billing parameters into new receipt code: ${newRNo}. Opening history to view.`);
    setActiveTab('history');
  };

  const handleRoleTransition = (target: UserRole) => {
    setUserRole(target);
    setIsRoleDropdownOpen(false);
    appendAuditLog(
      'Security Escalation',
      `Switched system session role level to ${target}. Updating programmatic database privileges.`
    );
  };

  // Simple custom tab navigation coordinator
  const handleTabNavigation = (tabName: string, receiptId?: string) => {
    if (receiptId) {
      setSelectedReceiptId(receiptId);
    } else {
      setSelectedReceiptId(null);
    }
    setActiveTab(tabName);
  };

  const activeSelectedReceipt = receipts.find(r => r.id === selectedReceiptId);

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-200 ${
      visualTheme === 'dark' 
        ? 'bg-slate-950 text-slate-100' 
        : visualTheme === 'deep-navy' 
        ? 'bg-[#040D1A] text-slate-100' 
        : 'bg-slate-50 text-gray-900'
    }`}>
      
      {/* --- ENTERPRISE GLOBAL UTILITY TOP HEADER BAR --- */}
      <header className={`no-print border-b select-none ${
        visualTheme === 'dark' 
          ? 'bg-slate-900/60 border-slate-800' 
          : visualTheme === 'deep-navy' 
          ? 'bg-[#091526] border-slate-800' 
          : 'bg-white border-gray-200'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* Branding Left header */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => handleTabNavigation('dashboard')}>
            <div className="p-2.5 bg-primary-600 rounded-xl text-white shadow-md shadow-primary-600/10 shrink-0">
              <Building2 className="h-5.5 w-5.5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-display font-bold text-sm tracking-tight">KRA eTIMS Hub</span>
                <span className="text-[10px] font-mono font-extrabold px-1.5 py-0.2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded">
                  v2.0
                </span>
              </div>
              <p className="text-[11px] text-gray-400 font-sans leading-none mt-1">
                Karoney School Supplies Billing System
              </p>
            </div>
          </div>

          {/* Quick Global Navigation Pills */}
          <nav className="flex items-center gap-1.5 bg-gray-100 dark:bg-slate-900/85 p-1 rounded-2xl">
            <button
              onClick={() => handleTabNavigation('dashboard')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-white dark:bg-slate-800 shadow text-primary-600 dark:text-white'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <LayoutDashboard className="h-4 w-4" />
              Overview
            </button>
            <button
              onClick={() => handleTabNavigation('builder-edit')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                activeTab.startsWith('builder') && !selectedReceiptId
                  ? 'bg-white dark:bg-slate-800 shadow text-primary-600 dark:text-white'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <FilePlus className="h-4 w-4" />
              New Receipt
            </button>
            <button
              onClick={() => handleTabNavigation('history')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                activeTab === 'history'
                  ? 'bg-white dark:bg-slate-800 shadow text-primary-600 dark:text-white'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <History className="h-4 w-4" />
              Archive
            </button>
          </nav>

          {/* Role selection & Settings controls right header */}
          <div className="flex items-center gap-3">
            
            {/* Visual theme selector nodes */}
            <div className="flex items-center bg-gray-100 dark:bg-slate-900 p-1 rounded-xl gap-1">
              <button 
                onClick={() => setVisualTheme('light')}
                className={`p-1.5 rounded-lg text-xs ${visualTheme === 'light' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400'}`}
                title="White Theme"
              >
                <Sun className="h-3.5 w-3.5" />
              </button>
              <button 
                onClick={() => setVisualTheme('dark')}
                className={`p-1.5 rounded-lg text-xs ${visualTheme === 'dark' ? 'bg-slate-800 text-white shadow-sm' : 'text-gray-400'}`}
                title="Modern Slate Dark"
              >
                <Moon className="h-3.5 w-3.5" />
              </button>
              <button 
                onClick={() => setVisualTheme('deep-navy')}
                className={`p-1.5 rounded-lg text-xs font-semibold ${visualTheme === 'deep-navy' ? 'bg-[#152740] text-blue-300 shadow-sm' : 'text-gray-400'}`}
                title="Deep Corporate Navy"
              >
                ★
              </button>
            </div>

            {/* Custom Interactive Security role manager dropdown */}
            <div className="relative">
              <button 
                onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
                className="px-3 py-1.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition cursor-pointer shadow-sm"
              >
                <ShieldCheck className="h-4 w-4 shrink-0" />
                <span>Perms: {userRole}</span>
                <ChevronDown className="h-3.5 w-3.5" />
              </button>
              
              {isRoleDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-slate-900 text-white rounded-2xl shadow-2xl border border-slate-700 p-2 z-50 text-xs">
                  <div className="px-3 py-2 border-b border-slate-800 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                    Switch Authentication Role Level
                  </div>
                  {['Super Admin', 'Principal', 'Bursar', 'Accountant', 'Teacher', 'Clerk'].map((role) => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => handleRoleTransition(role as UserRole)}
                      className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-800 hover:text-white transition-all text-xs flex items-center justify-between cursor-pointer"
                    >
                      <span>{role}</span>
                      {userRole === role && <span className="text-emerald-400 font-bold">✓ Active</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Settings button */}
            <button
              onClick={() => handleTabNavigation('settings')}
              className={`p-2 rounded-xl border transition cursor-pointer ${
                activeTab === 'settings'
                  ? 'bg-slate-100 dark:bg-slate-800 text-primary-600 border-primary-200'
                  : 'text-gray-500 border-gray-200 dark:border-slate-800 hover:bg-gray-100 dark:hover:bg-slate-900'
              }`}
              title="Institution Settings"
            >
              <Settings className="h-5 w-5" />
            </button>

          </div>
        </div>
      </header>

      {/* --- CORE WORKSPACE WRAPPER --- */}
      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
        
        {/* VIEW PREFERENCE TETHER FOR RECIPIENT PRINT AND DISPLAY */}
        {activeTab === 'dashboard' && (
          <Dashboard 
            receipts={receipts}
            onNavigate={handleTabNavigation}
            onDeleteReceipt={handleDeleteReceipt}
            onDuplicateReceipt={handleDuplicateReceipt}
            userRole={userRole}
            auditLogs={auditLogs}
          />
        )}

        {/* Builder View Node (Handles Printable copy viewer vs Builder-edit depending on tab) */}
        {activeTab === 'builder' && activeSelectedReceipt ? (
          <PrintWindow 
            receipt={activeSelectedReceipt}
            schoolConfig={schoolConfig}
            onBack={() => handleTabNavigation('dashboard')}
          />
        ) : activeTab === 'builder' ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-gray-200 shadow-sm max-w-md mx-auto space-y-4 my-12 text-slate-700">
            <Lock className="h-10 w-10 text-rose-500 mx-auto" />
            <h3 className="text-md font-bold text-gray-900">Illegal Ledger Reference Point</h3>
            <p className="text-xs text-gray-400">No active receipt parameter selected for preview mode. Please navigate over Overview or Archives list.</p>
            <button onClick={() => handleTabNavigation('dashboard')} className="px-4 py-2 bg-primary-600 text-white rounded-xl text-xs font-semibold cursor-pointer">
              Go to Dashboard
            </button>
          </div>
        ) : null}

        {/* Render builder-edit form workspace */}
        {(activeTab === 'builder-edit' || activeTab === 'builder-edit-loaded') && (
          <ReceiptForm 
            initialReceipt={activeSelectedReceipt}
            schoolConfig={schoolConfig}
            onSave={handleSaveReceipt}
            onCancel={() => handleTabNavigation('dashboard')}
            userRole={userRole}
          />
        )}

        {/* Render archives list space */}
        {activeTab === 'history' && (
          <ReceiptHistory 
            receipts={receipts}
            onNavigate={handleTabNavigation}
            onDeleteReceipt={handleDeleteReceipt}
            onDuplicateReceipt={handleDuplicateReceipt}
            userRole={userRole}
            schoolConfig={schoolConfig}
          />
        )}

        {/* Render global configurations manager */}
        {activeTab === 'settings' && (
          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm max-w-2xl mx-auto space-y-6">
            <div className="border-b border-gray-100 dark:border-slate-800 pb-4">
              <h2 className="text-lg font-display font-semibold text-gray-950 dark:text-white flex items-center gap-2">
                <Settings className="h-5 w-5 text-primary-500" />
                Karoney School Supplies Settings
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Customize general school headers, KRA registration parameters, and communication tethers.
              </p>
            </div>

            <div className="space-y-4 text-xs dark:text-slate-300">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5">Official School Name</label>
                  <input
                    type="text"
                    value={schoolConfig.name}
                    onChange={(e) => setSchoolConfig(prev => ({ ...prev, name: e.target.value.toUpperCase() }))}
                    className="w-full text-xs px-3.5 py-2.5 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5">School Motto / Vision</label>
                  <input
                    type="text"
                    value={schoolConfig.motto}
                    onChange={(e) => setSchoolConfig(prev => ({ ...prev, motto: e.target.value }))}
                    className="w-full text-xs px-3.5 py-2.5 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-xl italic"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5">KRA PIN ID *</label>
                  <input
                    type="text"
                    value={schoolConfig.kraPin}
                    onChange={(e) => setSchoolConfig(prev => ({ ...prev, kraPin: e.target.value.toUpperCase() }))}
                    className="w-full text-xs px-3.5 py-2.5 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-xl font-mono uppercase"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5">eTIMS Registrant Reference</label>
                  <input
                    type="text"
                    value={schoolConfig.etimsRegNo}
                    onChange={(e) => setSchoolConfig(prev => ({ ...prev, etimsRegNo: e.target.value }))}
                    className="w-full text-xs px-3.5 py-2.5 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-xl font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5">Primary Contact Line</label>
                  <input
                    type="text"
                    value={schoolConfig.phone1}
                    onChange={(e) => setSchoolConfig(prev => ({ ...prev, phone1: e.target.value }))}
                    className="w-full text-xs px-3 py-2 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-xl font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5">Secondary Line</label>
                  <input
                    type="text"
                    value={schoolConfig.phone2}
                    onChange={(e) => setSchoolConfig(prev => ({ ...prev, phone2: e.target.value }))}
                    className="w-full text-xs px-3 py-2 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-xl font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5">Email Link</label>
                  <input
                    type="text"
                    value={schoolConfig.email}
                    onChange={(e) => setSchoolConfig(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full text-xs px-3 py-2 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5">Postal Address</label>
                  <input
                    type="text"
                    value={schoolConfig.address}
                    onChange={(e) => setSchoolConfig(prev => ({ ...prev, address: e.target.value }))}
                    className="w-full text-xs px-3.5 py-2.5 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5">Physical Campus Address</label>
                  <input
                    type="text"
                    value={schoolConfig.postalAddress}
                    onChange={(e) => setSchoolConfig(prev => ({ ...prev, postalAddress: e.target.value }))}
                    className="w-full text-xs px-3.5 py-2.5 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-3 border-t border-gray-100 dark:border-slate-800">
                {/* --- SCHOOL LOGO UPLOADER --- */}
                <div className="space-y-2">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase">School Logo Brand</label>
                  <p className="text-[10px] text-gray-400 leading-normal">
                    Upload your school emblem/shield. This appears dynamically in client-facing invoices and tax statements.
                  </p>
                  
                  <div className="border border-dashed border-gray-200 dark:border-slate-800 hover:border-primary-400 rounded-xl p-4 bg-gray-50/50 dark:bg-slate-950/30 text-center relative group min-h-[140px] flex flex-col justify-center items-center">
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          const file = e.target.files[0];
                          const reader = new FileReader();
                          reader.onload = (loadEvent) => {
                            if (loadEvent.target?.result) {
                              setSchoolConfig(prev => ({
                                ...prev,
                                logoUrl: loadEvent.target?.result as string
                              }));
                            }
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    />

                    {schoolConfig.logoUrl ? (
                      <div className="space-y-2.5 z-10 pointer-events-auto">
                        <div className="relative mx-auto max-w-[80px] border border-gray-200 dark:border-slate-800 rounded-lg bg-white p-1 shadow-sm">
                          <img 
                            src={schoolConfig.logoUrl} 
                            alt="Logo preview" 
                            className="max-h-16 w-full object-contain rounded"
                          />
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setSchoolConfig(prev => ({ ...prev, logoUrl: null }));
                            }}
                            className="absolute -top-1.5 -right-1.5 p-1 bg-red-500 hover:bg-red-600 text-white rounded-full transition shadow-sm cursor-pointer"
                            title="Remove Logo"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                        <p className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400">Custom Logo Active</p>
                      </div>
                    ) : (
                      <div className="space-y-2 flex flex-col items-center justify-center text-center">
                        <KaroneyLogo size={64} className="hover:scale-105 transition-transform duration-200" />
                        <div>
                          <p className="text-[10.5px] font-bold text-emerald-600 dark:text-emerald-400">Official Crest Loaded</p>
                          <span className="text-[9px] text-gray-400 block">Click or drag file to replace with custom</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* --- DIGITAL OFFICIAL STAMP UPLOADER --- */}
                <div className="space-y-2">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase">Digital Official Stamp</label>
                  <p className="text-[10px] text-gray-400 leading-normal">
                    Upload an image file of your administrative stamp, or auto-generate a classic dater stamp matching the uploaded sample.
                  </p>
                  
                  <div className="border border-dashed border-gray-200 dark:border-slate-800 hover:border-primary-400 rounded-xl p-4 bg-gray-50/50 dark:bg-slate-950/30 text-center relative group min-h-[140px] flex flex-col justify-center items-center">
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          const file = e.target.files[0];
                          const reader = new FileReader();
                          reader.onload = (loadEvent) => {
                            if (loadEvent.target?.result) {
                              setSchoolConfig(prev => ({
                                ...prev,
                                schoolStampUrl: loadEvent.target?.result as string
                              }));
                            }
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    />

                    {schoolConfig.schoolStampUrl ? (
                      <div className="space-y-2.5 z-10 pointer-events-auto">
                        <div className="relative mx-auto max-w-[100px] border border-gray-200 dark:border-slate-800 rounded-lg bg-white p-1 shadow-sm">
                          <img 
                            src={schoolConfig.schoolStampUrl} 
                            alt="Stamp preview" 
                            className="max-h-16 w-full object-contain rounded"
                          />
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setSchoolConfig(prev => ({ ...prev, schoolStampUrl: null }));
                            }}
                            className="absolute -top-1.5 -right-1.5 p-1 bg-red-500 hover:bg-red-600 text-white rounded-full transition shadow-sm cursor-pointer"
                            title="Remove Stamp"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                        <p className="text-[10px] font-medium text-emerald-600">Official Stamp Loaded</p>
                      </div>
                    ) : (
                      <div className="space-y-1.5 pointer-events-none">
                        <div className="p-1.5 bg-gray-100 dark:bg-slate-900 rounded-full inline-block text-gray-400 group-hover:text-primary-500 transition-colors">
                          <Upload className="h-5 w-5" />
                        </div>
                        <p className="text-[10px] font-semibold text-gray-600 dark:text-gray-400">Upload Stamp Image</p>
                        <span className="text-[9px] text-gray-400">Click or drag file here</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Auto-generate official stamp matching upload_file_0 */}
                  <div className="pt-1 select-none">
                    <button
                      type="button"
                      onClick={() => {
                        const stamp = generateClassicOfficialStamp(
                          schoolConfig.name,
                          schoolConfig.address,
                          `Tel: ${schoolConfig.phone1}, ${schoolConfig.phone2}`,
                          schoolConfig.email,
                          "06 MAY 2026"
                        );
                        setSchoolConfig(prev => ({
                          ...prev,
                          schoolStampUrl: stamp
                        }));
                      }}
                      className="w-full py-1.5 px-3 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 dark:hover:bg-blue-900/40 border border-blue-200 dark:border-blue-900/60 text-blue-700 dark:text-blue-300 rounded-lg text-[9.5px] font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                      title="Generates a realistic rectangular rubber stamp with ink bleed dater"
                    >
                      🛡️ Auto-Generate Classic Stamp (High Fidelity)
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 dark:border-slate-800 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    saveConfigToStorage(schoolConfig);
                    appendAuditLog(
                      'Settings Modified',
                      'Configured general metadata structures and contact lines for the institutional campus.'
                    );
                    alert('🎉 Success! School parameters saved. Returning to dashboard...');
                    setActiveTab('dashboard');
                  }}
                  className="px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-semibold cursor-pointer shadow"
                >
                  Save General Settings
                </button>
              </div>

            </div>
          </div>
        )}

      </main>

      {/* --- FOOTER COPYRIGHT RAIL --- */}
      <footer className="no-print mt-12 py-6 border-t border-gray-200 dark:border-slate-900 text-center text-xs text-gray-400">
        <div>
          © 2026 Karoney School Supplies eTIMS Hub. All rights reserved. Powered by Kenya Revenue Authority Compliant API Terminals.
        </div>
      </footer>

    </div>
  );
}
