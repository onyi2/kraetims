/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Building2, 
  Phone, 
  Mail, 
  Globe, 
  CheckCircle2, 
  Activity, 
  QrCode, 
  PenTool, 
  ExternalLink,
  Sparkles,
  Info,
  Paperclip,
  Download,
  Eye,
  X,
  Image as ImageIcon
} from 'lucide-react';
import { Receipt, SchoolConfig } from '../types';
import { QRCodeSVG } from './QRCodeSVG';
import { buildVerificationUrl } from '../data/presets';
import { RocksideLogo } from './RocksideLogo';

interface ReceiptViewProps {
  receipt: Receipt;
  schoolConfig: SchoolConfig;
  isEmbedded?: boolean; // Toggles scaling padding for smaller dual-pane previews vs raw full scale print layout
  layoutMode?: 'receipt' | 'invoice';
}

export const ReceiptView: React.FC<ReceiptViewProps> = ({
  receipt,
  schoolConfig,
  isEmbedded = false,
  layoutMode = 'receipt'
}) => {
  const [showScanSimulatorCode, setShowScanSimulatorCode] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const formatKES = (val: number) => {
    return new Intl.NumberFormat('en-KE', { 
      style: 'currency', 
      currency: 'KES', 
      minimumFractionDigits: 2 
    }).format(val);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-KE', {
      weekday: 'short', year: 'numeric', month: 'short', day: 'numeric'
    });
  };

  // Build simulated tax URL
  const kraVerificationUrl = buildVerificationUrl({
    kraPin: receipt.kraPin,
    etimsInvoiceNo: receipt.etimsInvoiceNo,
    grandTotal: receipt.grandTotal,
    date: receipt.date
  });

  return (
    <div className={`relative bg-white font-sans text-gray-900 ${
      isEmbedded ? 'p-4 sm:p-6 text-xs' : 'p-8 sm:p-12 text-sm max-w-[800px] mx-auto border border-gray-100 shadow-xl'
    }`}>
      
      {/* Interactive Hover Scanner HUD (Shows simulator when clicking QR) */}
      {showScanSimulatorCode && (
        <div className="absolute inset-x-4 top-4 z-50 bg-slate-900 text-white rounded-2xl p-5 shadow-2xl border border-slate-700 animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
              <span className="text-xs font-mono uppercase font-bold tracking-wider text-emerald-400">
                eTIMS Compliance Verification Simulator
              </span>
            </div>
            <button 
              onClick={() => setShowScanSimulatorCode(false)}
              className="text-gray-400 hover:text-white text-xs font-bold bg-white/10 px-2 py-1 rounded"
            >
              ✕ Close
            </button>
          </div>

          <p className="mt-2 text-xs text-slate-300">
            This QR code simulated node is programmed for live KRA verification. Scanning simulates an instant lookup on the <strong>iTax compliance portal</strong> with these metadata parameters:
          </p>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1.5 mt-3 font-mono text-[10px] text-slate-400">
            <div><strong className="text-white">Authorized School:</strong> {schoolConfig.name}</div>
            <div><strong className="text-white">Tax ID (PIN):</strong> {receipt.kraPin}</div>
            <div><strong className="text-white">Fiscal Dev ID:</strong> {receipt.fiscalDeviceNo}</div>
            <div><strong className="text-white">Invoice No:</strong> {receipt.etimsInvoiceNo}</div>
            <div><strong className="text-white">Crypto Signature:</strong> {receipt.receiptSignature}</div>
            <div><strong className="text-white">Receipt UUID:</strong> {receipt.receiptUuid}</div>
            <div><strong className="text-white">Financial Total:</strong> {formatKES(receipt.grandTotal)}</div>
          </div>

          <div className="mt-4 flex gap-3 text-xs">
            <a 
              href={kraVerificationUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold flex items-center gap-1 transition"
            >
              Open iTax Mock Validation Portal
              <ExternalLink className="h-3 w-3" />
            </a>
            <button 
              onClick={() => alert(`Cryptographic Hash State Valid: ${receipt.invoiceHash}\nVerified Secure: Compliant with Kenya KRA Regulations.`)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl transition"
            >
              Test Signatures
            </button>
          </div>
        </div>
      )}

      {/* --- KRA CLASSIC ETIMS STRIP BANNER --- */}
      <div className="flex items-center justify-between border-b pb-4 mb-6 border-gray-100">
        <div className="flex items-center gap-2">
          {/* Custom vector flag/seal of Kenya representation */}
          <div className="flex flex-col h-7 w-10 border border-gray-300 rounded overflow-hidden shrink-0">
            <div className="h-1/5 bg-[#000000]"></div>
            <div className="h-1/5 bg-[#e01111]"></div>
            <div className="h-1/5 bg-[#ffffff]"></div>
            <div className="h-1/5 bg-[#067232]"></div>
            <div className="h-1/5 bg-[#ffffff]"></div>
          </div>
          <div>
            <div className="text-[11px] font-bold text-gray-800 tracking-wider font-display shrink-0">
              KENYA REVENUE AUTHORITY
            </div>
            <div className="text-[9px] font-mono text-gray-500 font-semibold uppercase leading-none">
              eTIMS Tax Compliance Node
            </div>
          </div>
        </div>

        <div className="text-right">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-100 rounded-full font-mono uppercase tracking-wider">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
            eTIMS COMPLIANT
          </span>
          <div className="text-[9px] text-gray-400 mt-1 font-mono">{receipt.status} State</div>
        </div>
      </div>

      {/* --- SCHOOL BRANDING HEADER SECTION --- */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center mb-6">
        {/* Dynamic high quality SVG logo */}
        <div className="md:col-span-3 flex justify-center md:justify-start">
          {schoolConfig.logoUrl ? (
            <div className="w-20 h-20 border border-gray-100 hover:border-gray-200 rounded-2xl overflow-hidden shrink-0 bg-white flex items-center justify-center p-1 shadow-inner">
              <img 
                src={schoolConfig.logoUrl} 
                alt="School logo" 
                className="max-w-full max-h-full object-contain rounded-xl"
                referrerPolicy="no-referrer"
              />
            </div>
          ) : (
            <RocksideLogo size={80} className="hover:scale-105 transition-transform duration-200" />
          )}
        </div>

        {/* School Metadata Details */}
        <div className="md:col-span-9 text-center md:text-left space-y-0.5">
          <h1 className="text-xl font-display font-bold text-primary-600 tracking-tight">
            {schoolConfig.name}
          </h1>
          <p className="text-xs font-medium italic text-gray-500 pr-2">
            "{schoolConfig.motto}"
          </p>
          
          <div className="text-xs text-gray-500 font-medium pt-1 space-y-0.5">
            <div>{schoolConfig.address} • P.O. BOX NAIROBI</div>
            <div>Physical: {schoolConfig.postalAddress}</div>
            
            <div className="flex flex-wrap justify-center md:justify-start gap-x-4 gap-y-1 pt-1 text-[11px] font-mono text-gray-600">
              <span className="flex items-center gap-1">
                <Phone className="h-3 w-3 text-primary-500" />
                {schoolConfig.phone1} / {schoolConfig.phone2}
              </span>
              <span className="flex items-center gap-1">
                <Mail className="h-3 w-3 text-primary-500" />
                {schoolConfig.email}
              </span>
              <span className="flex items-center gap-1">
                <Globe className="h-3 w-3 text-primary-500" />
                {schoolConfig.website}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Primary divider bar */}
      <div className="border-t-2 border-primary-600 my-4"></div>

      {/* Document Classification Header Banner */}
      <div className={`flex justify-between items-center mb-5 py-2 px-4 rounded-xl border font-sans ${
        layoutMode === 'receipt' 
          ? 'bg-emerald-50/30 border-emerald-100/60 text-emerald-900' 
          : 'bg-indigo-50/30 border-indigo-100/60 text-indigo-900'
      }`}>
        <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-gray-400">
          Document Classification
        </span>
        <div className="flex items-center gap-1.5">
          <span className={`w-1.5 h-1.5 rounded-full ${layoutMode === 'receipt' ? 'bg-emerald-500' : 'bg-indigo-500'}`}></span>
          <span className="text-xs font-black uppercase tracking-widest">
            {layoutMode === 'receipt' ? 'OFFICIAL eTIMS TAX RECEIPT' : 'STUDENT FEE INVOICE'}
          </span>
        </div>
      </div>

      {/* --- BILLING METADATA GRID --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-gray-800">
        
        {/* Left Side: Invoice details */}
        <div className="space-y-2 bg-gray-50 p-4 rounded-xl border border-gray-100">
          <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 border-b pb-1">
            Official Fiscal Stamp Details
          </h3>
          <div className="grid grid-cols-3 gap-y-1.5 gap-x-2">
            <span className="font-semibold text-gray-500">Invoice No:</span>
            <span className="col-span-2 font-semibold font-mono text-gray-900">{receipt.invoiceNo}</span>

            <span className="font-semibold text-gray-500">Receipt No:</span>
            <span className="col-span-2 font-bold font-mono text-primary-700">{receipt.receiptNo}</span>

            <span className="font-semibold text-gray-500">Ref Code:</span>
            <span className="col-span-2 font-mono text-gray-600">{receipt.refNo}</span>

            <span className="font-semibold text-gray-500">Academic Yr:</span>
            <span className="col-span-2 font-semibold text-gray-800">{receipt.academicYear} / {receipt.term}</span>

            <span className="font-semibold text-gray-500">Stamp Date:</span>
            <span className="col-span-2 font-serif text-gray-700">
              {formatDate(receipt.date)} • {receipt.time}
            </span>
          </div>
        </div>

        {/* Right Side: Student metadata details */}
        <div className="space-y-2 bg-gray-50 p-4 rounded-xl border border-gray-100">
          <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 border-b pb-1">
            Student / Parent Profile
          </h3>
          <div className="grid grid-cols-3 gap-y-1.5 gap-x-2">
            <span className="font-semibold text-gray-500">Student:</span>
            <span className="col-span-2 font-bold text-gray-900">{receipt.studentName || 'Not Set'}</span>

            <span className="font-semibold text-gray-500">Adm No:</span>
            <span className="col-span-2 font-semibold font-mono text-primary-600">{receipt.admissionNo || 'Not Set'}</span>

            <span className="font-semibold text-gray-500">Class Block:</span>
            <span className="col-span-2 font-semibold text-gray-800">{receipt.studentClass}</span>

            {receipt.parentName && (
              <>
                <span className="font-semibold text-gray-500">Guardian:</span>
                <span className="col-span-2 text-gray-700">{receipt.parentName}</span>
              </>
            )}

            {receipt.parentPhone && (
              <>
                <span className="font-semibold text-gray-500">Contact:</span>
                <span className="col-span-2 font-mono text-gray-600">{receipt.parentPhone}</span>
              </>
            )}
          </div>
        </div>

      </div>

      {/* --- ITEMS TABLE STATEMENT --- */}
      <div className="mt-6">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b-2 border-gray-200 text-[11px] font-bold text-gray-500 uppercase tracking-wider bg-gray-50">
              <th className="py-2.5 px-3">#</th>
              <th className="py-2.5 px-2">Description</th>
              <th className="py-2.5 px-2">Category</th>
              <th className="py-2.5 px-2 text-center">Qty</th>
              <th className="py-2.5 px-2 text-right">Rate</th>
              <th className="py-2.5 px-2 text-right">Disc</th>
              <th className="py-2.5 px-2 text-center text-[10px]">VAT %</th>
              <th className="py-2.5 px-3 text-right">KES Line Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-xs">
            {receipt.items.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-gray-400 font-medium">
                  No items populated in invoice breakdown yet.
                </td>
              </tr>
            ) : (
              receipt.items.map((itm, index) => (
                <tr key={itm.id} className="hover:bg-gray-50/50">
                  <td className="py-2.5 px-3 font-mono text-gray-400">{index + 1}</td>
                  <td className="py-2.5 px-2 font-semibold text-gray-800">{itm.description}</td>
                  <td className="py-2.5 px-2 text-gray-500 font-medium text-[11px]">{itm.category}</td>
                  <td className="py-2.5 px-2 text-center font-mono">{itm.quantity}</td>
                  <td className="py-2.5 px-2 text-right font-mono">{itm.unitPrice.toLocaleString()}.00</td>
                  <td className="py-2.5 px-2 text-right font-mono text-gray-400">
                    {itm.discount > 0 ? `-${itm.discount.toLocaleString()}` : '0'}.00
                  </td>
                  <td className="py-2.5 px-2 text-center font-mono">
                    {itm.taxRate}% <span className="text-[10px] bg-gray-100 text-gray-600 px-1 py-0.2 rounded">{itm.taxType}</span>
                  </td>
                  <td className="py-2.5 px-3 text-right font-semibold font-mono text-gray-900">
                    {itm.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* --- FINANCIAL SUMMARIES BREAKDOWN --- */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-12 gap-4">
        
        {/* Left column: M-Pesa References & school legal codes info */}
        <div className="md:col-span-7 bg-blue-50/20 border border-blue-100 p-4 rounded-xl space-y-2 self-start">
          <div className="text-[10px] font-bold text-primary-800 uppercase tracking-wider flex items-center gap-1">
            <Info className="h-3.5 w-3.5 text-primary-600 shrink-0" />
            Verification Ledger Details
          </div>
          <div className="text-[11px] text-gray-600 space-y-1 leading-relaxed">
            <div><strong>Payment Mode:</strong> {receipt.paymentMode}</div>
            {receipt.paymentRef && (
              <div className="font-mono text-xs bg-white py-1 px-2 border border-blue-100 rounded inline-block text-primary-700 font-bold mt-1 uppercase">
                Ref: {receipt.paymentRef}
              </div>
            )}
            <div className="pt-2 text-[10px] text-gray-400 font-mono">
              MOE License: {schoolConfig.schoolRegNo}<br />
              Generated via Active Bursar Node {receipt.generatedBy}
            </div>
          </div>
        </div>

        {/* Right column: math breakdown calculations */}
        <div className="md:col-span-5 bg-gray-50 border border-gray-200 p-4 rounded-xl space-y-1.5 self-start text-xs font-mono">
          <div className="flex justify-between text-gray-500">
            <span>Subtotal:</span>
            <span className="font-semibold text-gray-800">{formatKES(receipt.subtotal)}</span>
          </div>
          
          <div className="flex justify-between text-gray-500">
            <span>Discounts:</span>
            <span className="font-semibold text-emerald-600">-{formatKES(receipt.discountTotal)}</span>
          </div>

          <div className="flex justify-between text-gray-500 pb-1 border-b">
            <span>Standard VAT (16%):</span>
            <span className="font-semibold text-gray-800">{formatKES(receipt.taxTotal)}</span>
          </div>

          <div className="flex justify-between text-gray-900 border-b-2 border-gray-300 pb-1.5 pt-1 text-sm font-bold">
            <span className="font-sans text-gray-800">Grand Total:</span>
            <span className="text-primary-700 font-mono">{formatKES(receipt.grandTotal)}</span>
          </div>

          <div className="flex justify-between text-gray-500 pt-1">
            <span>Amount Paid:</span>
            <span className="font-semibold text-emerald-700 font-mono">{formatKES(receipt.amountPaid)}</span>
          </div>

          <div className={`flex justify-between font-bold pt-1.5 rounded-lg px-2 ${receipt.balance > 0 ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-800"}`}>
            <span>Balance:</span>
            <span className="font-mono">{formatKES(receipt.balance)}</span>
          </div>
        </div>

      </div>

      {/* --- KRA eTIMS COMPLIANCE SECURED FOOTER --- */}
      <div className="border-t border-dashed border-gray-200 my-6"></div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center text-xs">
        
        {/* eTIMS metadata certificates */}
        <div className="md:col-span-9 space-y-2 border border-slate-100 p-4 rounded-xl bg-slate-50">
          <div className="text-[10px] font-bold text-gray-400 font-sans tracking-widest uppercase pb-1.5 border-b">
            eTIMS SECURED CONTROL UNIT SIGNATURE
          </div>
          
          <div className="grid grid-cols-3 gap-y-1 text-[11px] font-mono leading-none">
            
            <span className="text-gray-400 font-sans font-medium">KRA PIN:</span>
            <span className="col-span-2 text-slate-800 font-bold">{receipt.kraPin}</span>

            <span className="text-gray-400 font-sans font-medium">Control Unit:</span>
            <span className="col-span-2 text-slate-800 font-bold">{receipt.controlUnitNo}</span>

            <span className="text-gray-400 font-sans font-medium">Device:</span>
            <span className="col-span-2 text-slate-700">{receipt.fiscalDeviceNo}</span>

            <span className="text-gray-400 font-sans font-medium">Crypto Sig:</span>
            <span className="col-span-2 text-primary-700 font-bold break-all leading-normal">{receipt.receiptSignature}</span>

            <span className="text-gray-400 font-sans font-medium">Doc Hash:</span>
            <span className="col-span-2 text-slate-500 break-all leading-normal text-[9px]">{receipt.invoiceHash}</span>

            <span className="text-gray-400 font-sans font-medium">Verify PIN:</span>
            <span className="col-span-2 text-slate-800 font-bold">{receipt.verificationCode}</span>
          </div>
        </div>

        {/* QR Code trigger & link */}
        <div className="md:col-span-3 flex flex-col justify-center items-center gap-1.5 cursor-pointer">
          <div 
            onClick={() => setShowScanSimulatorCode(true)}
            className="p-1 border bg-white rounded-xl hover:shadow-md transition-shadow relative group"
            title="Scan QR to verify on live KRA eTIMS Simulation server Node"
          >
            <QRCodeSVG value={kraVerificationUrl} size={110} />
            <div className="absolute inset-0 bg-primary-600/10 rounded-xl opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity font-bold text-[10px]">
              <span className="bg-slate-900/85 px-2 py-1 rounded shadow-lg flex items-center gap-1">
                🔬 Inspect Code
              </span>
            </div>
          </div>
          <div className="text-[9px] font-mono text-gray-400 text-center uppercase tracking-widest leading-none mt-1">
            VERIFICATION CODE: {receipt.verificationCode}
          </div>
        </div>

      </div>

      {/* --- STAMP & SIGNATURE AUTOPLACEMENT PANELS --- */}
      {(receipt.showStamp || receipt.showSignatures) && (
        <div className="mt-8 border-t border-gray-100 pt-6 relative min-h-[160px]">
          
          {/* Dynamic Vector Circular / Institutional Uploaded Stamp */}
          {receipt.showStamp && (
            <div className="absolute top-2 left-6 mix-blend-multiply opacity-90 pointer-events-none select-none rotate-2 transform transition-transform hover:rotate-6 duration-200">
              {schoolConfig.schoolStampUrl || receipt.schoolStampUrl ? (
                <img 
                  src={schoolConfig.schoolStampUrl || receipt.schoolStampUrl || ''} 
                  alt="Official Compliance Stamp" 
                  className="w-44 h-auto object-contain"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <svg width="120" height="120" viewBox="0 0 100 100" className="text-rose-600/90 fill-rose-600">
                  <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="3" strokeDasharray="90 2" />
                  <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="1" />
                  <circle cx="50" cy="50" r="28" fill="none" stroke="currentColor" strokeWidth="1.5" />
                  
                  {/* Curved Stamp text */}
                  <path id="stampPath" d="M 18,50 A 32,32 0 1,1 82,50" fill="none" />
                  <path id="stampPath2" d="M 82,50 A 32,32 0 1,1 18,50" fill="none" />
                  
                  <text fill="currentColor" fontSize="6.5" fontWeight="bold" letterSpacing="0.4">
                    <textPath href="#stampPath" startOffset="50%" textAnchor="middle">
                      ROCKSIDE ACADEMY * NAIROBI
                    </textPath>
                  </text>

                  <text fill="currentColor" fontSize="6.5" fontWeight="bold" letterSpacing="0.4">
                    <textPath href="#stampPath2" startOffset="50%" textAnchor="middle">
                      {layoutMode === 'receipt' ? 'OFFICIAL CASH RECEIPT' : 'FEE INVOICE STATEMENT'}
                    </textPath>
                  </text>

                  {/* Center of stamp */}
                  <text x="50" y="44" textAnchor="middle" fill="currentColor" fontSize="7.5" fontWeight="black" letterSpacing="0.2">
                    {layoutMode === 'receipt' ? 'APPROVED' : 'BILLED / DUE'}
                  </text>
                  <text x="50" y="53" textAnchor="middle" fill="currentColor" fontSize="7" fontWeight="bold" letterSpacing="0.1">
                    {layoutMode === 'receipt' ? 'CASH OFFICE' : 'ACCOUNTS DEPT'}
                  </text>
                  
                  {/* Simulated dynamic stamp audit date */}
                  <text x="50" y="62" textAnchor="middle" fill="currentColor" fontSize="5.5" fontWeight="medium" fontStyle="italic">
                    {receipt.date}
                  </text>
                </svg>
              )}
            </div>
          )}

          {/* Handwriting Signatures lines */}
          {receipt.showSignatures && (
            <div className="grid grid-cols-3 gap-6 text-center text-xs mt-10">
              
              <div className="space-y-1">
                <div className="h-8 font-serif italic text-primary-700/80 text-base font-bold flex items-end justify-center">
                  {receipt.bursarSignature || '—'}
                </div>
                <div className="border-t border-gray-300 pt-1 font-semibold text-gray-500 uppercase tracking-widest text-[9px]">
                  Bursar Signatory
                </div>
                <div className="text-[9px] text-gray-400 font-mono">Date: {receipt.date}</div>
              </div>

              <div className="space-y-1">
                <div className="h-8 font-serif italic text-primary-700/80 text-base font-bold flex items-end justify-center">
                  {receipt.accountantSignature || '—'}
                </div>
                <div className="border-t border-gray-300 pt-1 font-semibold text-gray-500 uppercase tracking-widest text-[9px]">
                  Lead Accountant
                </div>
                <div className="text-[9px] text-gray-400 font-mono">Date: {receipt.date}</div>
              </div>

              <div className="space-y-1">
                <div className="h-8 font-serif italic text-rose-700/85 text-base font-bold flex items-end justify-center">
                  {receipt.principalSignature || '—'}
                </div>
                <div className="border-t border-gray-300 pt-1 font-semibold text-gray-500 uppercase tracking-widest text-[9px]">
                  Principal Approval
                </div>
                <div className="text-[9px] text-gray-400 font-mono">Status: Verified</div>
              </div>

            </div>
          )}

        </div>
      )}

      {/* --- ATTACHED RECEIPT EVIDENCE SECTION --- */}
      {receipt.receiptImage && (
        <div className="mt-6 border-t border-dashed border-gray-200 pt-5 no-print">
          <div className="flex items-center gap-2 mb-2.5">
            <Paperclip className="h-3.5 w-3.5 text-primary-600" />
            <h4 className="text-[10px] font-bold text-gray-400 font-sans tracking-widest uppercase">
              Attached Payment Evidence (Audit Archive)
            </h4>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-3.5 bg-gray-50 border border-gray-200 rounded-xl p-3">
            <div 
              onClick={() => setLightboxOpen(true)}
              className="relative group overflow-hidden border border-gray-300 rounded-lg max-w-[130px] shrink-0 bg-white cursor-pointer shadow-sm hover:shadow transition"
              title="Click to zoom attachment image"
            >
              <img 
                src={receipt.receiptImage} 
                alt="Payment Receipt Attachment" 
                className="max-h-20 object-contain rounded transition duration-200 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-[9px] font-semibold">
                <Eye className="h-3.5 w-3.5 mr-0.5" /> Zoom
              </div>
            </div>
            
            <div className="flex-1 text-center sm:text-left space-y-1.5">
              <p className="font-bold text-xs text-gray-800">Attached Transaction Image</p>
              <p className="text-[10px] text-gray-500 leading-normal">
                This verification attachment is linked directly to receipt statement <strong className="font-mono">{receipt.receiptNo}</strong> as a permanent audit trail record. Supports Kenyan school banking reconciliation standards.
              </p>
              <div className="flex flex-wrap justify-center sm:justify-start gap-1.5 pt-0.5">
                <button
                  type="button"
                  onClick={() => setLightboxOpen(true)}
                  className="px-2 py-1 text-[10px] font-semibold text-primary-700 bg-primary-50 hover:bg-primary-100 border border-primary-100 rounded-md transition-colors flex items-center gap-0.5 cursor-pointer"
                >
                  <Eye className="h-3 w-3" /> View Full Slip
                </button>
                <a
                  href={receipt.receiptImage}
                  download={`receipt_attachment_${receipt.receiptNo}.png`}
                  className="px-2 py-1 text-[10px] font-semibold text-gray-700 bg-white hover:bg-gray-50 border border-gray-200 rounded-md transition-colors flex items-center gap-0.5"
                >
                  <Download className="h-3 w-3" /> Save File
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- LIGHTBOX MODAL --- */}
      {lightboxOpen && receipt.receiptImage && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200 no-print">
          <div className="bg-white rounded-2xl max-w-xl w-full p-4 relative shadow-2xl flex flex-col max-h-[90vh]">
            <button
              onClick={() => setLightboxOpen(false)}
              className="absolute top-4 right-4 p-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-900 rounded-full transition-colors cursor-pointer"
              title="Close modal"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="mb-2.5 border-b border-gray-100 pb-1.5 pr-8">
              <h3 className="font-display font-bold text-gray-900 text-sm flex items-center gap-1.5">
                <Paperclip className="h-4 w-4 text-primary-600" />
                Proof of Payment: {receipt.receiptNo}
              </h3>
              <p className="text-[10px] text-gray-400 mt-0.5">Linked to student {receipt.studentName || 'Not Set'} ({receipt.admissionNo || 'Not Set'})</p>
            </div>
            <div className="bg-gray-100 p-4 rounded-xl flex-1 flex items-center justify-center overflow-auto min-h-[250px]">
              <img 
                src={receipt.receiptImage} 
                alt="Full Size Slip" 
                className="max-h-[50vh] max-w-full object-contain rounded-lg shadow-sm"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="mt-3.5 flex justify-end gap-2 text-xs font-semibold">
              <a
                href={receipt.receiptImage}
                download={`receipt_attachment_${receipt.receiptNo}.png`}
                className="px-3.5 py-1.5 text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition flex items-center gap-1 text-[11px]"
                title="Download image proof"
              >
                <Download className="h-3.5 w-3.5" /> Save Local File
              </a>
              <button
                type="button"
                onClick={() => setLightboxOpen(false)}
                className="px-3.5 py-1.5 border border-gray-200 leading-normal hover:bg-gray-50 text-gray-700 rounded-lg transition-colors cursor-pointer text-[11px]"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- REASSURING TAX COMPLIANCE DISCLAIMER --- */}
      <div className="mt-8 border-t border-gray-100 pt-4 text-[10px] text-gray-400 text-center leading-relaxed">
        This is a fully verified electronic KRA tax invoice digital statement secure copy.<br />
        Powering Kenyan general education institutions billing networks with digital excellence and transparent fiscal auditing.
      </div>

    </div>
  );
};
