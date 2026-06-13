/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Printer, 
  Download, 
  ArrowLeft, 
  Maximize2, 
  AppWindow, 
  Laptop, 
  Smartphone,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Receipt, SchoolConfig } from '../types';
import { ReceiptView } from './ReceiptView';
import { buildVerificationUrl } from '../data/presets';
import { QRCodeSVG } from './QRCodeSVG';

interface PrintWindowProps {
  receipt: Receipt;
  schoolConfig: SchoolConfig;
  onBack: () => void;
}

export const PrintWindow: React.FC<PrintWindowProps> = ({
  receipt,
  schoolConfig,
  onBack
}) => {
  // Format Layout Type state
  const [paperLayout, setPaperLayout] = useState<'A4' | 'A4-Landscape' | '80mm'>('A4');
  const [isDownloading, setIsDownloading] = useState(false);
  const [layoutMode, setLayoutMode] = useState<'receipt' | 'invoice'>('receipt');

  const formatKES = (val: number) => {
    return new Intl.NumberFormat('en-KE', { 
      style: 'currency', 
      currency: 'KES', 
      minimumFractionDigits: 2 
    }).format(val);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-KE', {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  };

  const formatETRDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      if (!isNaN(d.getTime())) {
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const day = String(d.getDate()).padStart(2, '0');
        const month = months[d.getMonth()];
        const year = d.getFullYear();
        return `${day}-${month}-${year}`;
      }
    } catch (e) {}
    return dateStr;
  };

  // 1-Click native browser save/print invocation
  const handleNativePrint = () => {
    window.print();
  };

  // Shortcut event listener to trigger native printing on Ctrl+P or Cmd+P
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for lower-case 'p' or uppercase 'P' to be extra robust
      if ((e.ctrlKey || e.metaKey) && (e.key === 'p' || e.key === 'P')) {
        e.preventDefault();
        handleNativePrint();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Generates a fully compiled standalone A4 HTML file as fallback download simulating PDF output
  const handleSimulatePDFDownload = () => {
    setIsDownloading(true);
    
    setTimeout(() => {
      // Create clean filename based on guidelines: ReceiptNumber_StudentName_Date.pdf
      const cleanStudentName = receipt.studentName.replace(/[^a-zA-Z0-9]/g, "_");
      const filename = `${receipt.receiptNo}_${cleanStudentName}_${receipt.date}.html`;

      // Build extreme standalone full-css printable HTML source
      const standaloneHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${receipt.receiptNo} - Rockside Academy Receipt</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap');
    body {
      font-family: 'Inter', sans-serif;
      background-color: white;
      color: #111827;
      margin: 0;
      padding: 40px;
    }
    .container {
      max-width: 800px;
      margin: 0 auto;
      border: 1px solid #e5e7eb;
      padding: 40px;
      border-radius: 12px;
      box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
    }
    .header-banner {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid #f3f4f6;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .tax-badge {
      font-weight: bold;
      color: #065f46;
      background-color: #ecfdf5;
      padding: 6px 16px;
      border-radius: 9999px;
      font-size: 11px;
      text-transform: uppercase;
      font-family: 'JetBrains Mono', monospace;
    }
    .school-info {
      margin-bottom: 30px;
    }
    .school-name {
      font-size: 24px;
      color: #0d47a1;
      font-weight: bold;
      margin: 0 0 4px 0;
    }
    .school-motto {
      font-style: italic;
      color: #6b7280;
      font-size: 13px;
      margin: 0 0 12px 0;
    }
    .school-details {
      font-size: 12px;
      color: #6b7280;
      line-height: 1.6;
    }
    .meta-box {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 30px;
      margin-bottom: 30px;
    }
    .meta-card {
      background-color: #f9fafb;
      padding: 20px;
      border-radius: 8px;
      font-size: 12px;
      border: 1px solid #f3f4f6;
    }
    .meta-title {
      font-size: 10px;
      font-weight: bold;
      color: #9ca3af;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      border-bottom: 1px solid #f3f4f6;
      padding-bottom: 8px;
      margin-bottom: 12px;
    }
    .meta-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
    }
    .meta-label {
      font-weight: 500;
      color: #6b7280;
    }
    .meta-val {
      font-weight: 600;
      color: #111827;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 35px;
      font-size: 13px;
    }
    th {
      background-color: #f9fafb;
      padding: 10px 12px;
      font-weight: 600;
      color: #4b5563;
      border-bottom: 2px solid #e5e7eb;
      text-align: left;
    }
    td {
      padding: 12px;
      border-bottom: 1px solid #f3f4f6;
    }
    .right-align {
      text-align: right;
    }
    .center-align {
      text-align: center;
    }
    .ledger-math {
      display: flex;
      justify-content: flex-end;
      margin-bottom: 40px;
    }
    .math-card {
      width: 300px;
      background-color: #f9fafb;
      padding: 20px;
      border-radius: 8px;
      font-size: 12px;
      border: 1px solid #e5e7eb;
      font-family: 'JetBrains Mono', monospace;
    }
    .total-row {
      font-weight: bold;
      font-size: 14px;
      color: #0d47a1;
      border-top: 1px dashed #cbd5e1;
      padding-top: 8px;
      margin-top: 8px;
    }
    .etims-footer {
      background-color: #0f172a;
      color: #f1f5f9;
      padding: 24px;
      border-radius: 8px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
      line-height: 1.6;
    }
    .print-btn {
      display: block;
      width: 180px;
      margin: 30px auto 0 auto;
      background-color: #0d47a1;
      color: white;
      text-align: center;
      padding: 12px;
      border-radius: 6px;
      text-decoration: none;
      font-family: sans-serif;
      font-size: 13px;
      font-weight: bold;
    }
    @media print {
      .print-btn { display: none; }
      body { padding: 0; }
      .container { border: none; box-shadow: none; padding: 0; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header-banner">
      <div style="font-weight: bold; font-size: 14px; color: #111827;">KENYA REVENUE AUTHORITY</div>
      <div class="tax-badge">eTIMS COMPLIANT</div>
    </div>
    
    <div class="school-info">
      <h1 class="school-name">${schoolConfig.name}</h1>
      <p class="school-motto">"${schoolConfig.motto}"</p>
      <div class="school-details">
        ${schoolConfig.address} • Phone: ${schoolConfig.phone1}<br>
        Email: ${schoolConfig.email} | KRA PIN: ${receipt.kraPin}
      </div>
    </div>

    <!-- Document Classification -->
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; padding: 10px 16px; border-radius: 8px; border: 1px solid ${layoutMode === 'receipt' ? '#a7f3d0' : '#c7d2fe'}; background-color: ${layoutMode === 'receipt' ? '#f0fdf4' : '#f5f3ff'}; font-size: 11px;">
      <span style="font-weight: bold; color: #6b7280; font-family: 'JetBrains Mono', monospace; font-size: 9px; text-transform: uppercase; letter-spacing: 0.05em;">Document Classification</span>
      <span style="font-weight: 800; color: ${layoutMode === 'receipt' ? '#065f46' : '#3730a3'}; font-family: sans-serif; text-transform: uppercase; letter-spacing: 0.05em;">
        ${layoutMode === 'receipt' ? 'OFFICIAL eTIMS TAX RECEIPT' : 'STUDENT FEE INVOICE / STATEMENT'}
      </span>
    </div>

    <div class="meta-box">
      <div class="meta-card">
        <div class="meta-title">Official Stamp Details</div>
        <div class="meta-row"><span class="meta-label">Receipt No:</span><span class="meta-val">${receipt.receiptNo}</span></div>
        <div class="meta-row"><span class="meta-label">Invoice No:</span><span class="meta-val">${receipt.invoiceNo}</span></div>
        <div class="meta-row"><span class="meta-label">Issued Date:</span><span class="meta-val">${formatDate(receipt.date)} • ${receipt.time}</span></div>
        <div class="meta-row"><span class="meta-label">Academic:</span><span class="meta-val">${receipt.academicYear} - ${receipt.term}</span></div>
      </div>
      
      <div class="meta-card">
        <div class="meta-title">Student Profile</div>
        <div class="meta-row"><span class="meta-label">Student:</span><span class="meta-val">${receipt.studentName}</span></div>
        <div class="meta-row"><span class="meta-label">Adm No:</span><span class="meta-val">${receipt.admissionNo}</span></div>
        <div class="meta-row"><span class="meta-label">Class:</span><span class="meta-val">${receipt.studentClass}</span></div>
        <div class="meta-row"><span class="meta-label">Payment:</span><span class="meta-val">${receipt.paymentMode} (${receipt.paymentRef || 'N/A'})</span></div>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>Description</th>
          <th>Category</th>
          <th class="center-align">Qty</th>
          <th class="right-align">Unit Price</th>
          <th class="right-align">Total Price</th>
        </tr>
      </thead>
      <tbody>
        ${receipt.items.map((i, idx) => `
          <tr>
            <td>${idx + 1}</td>
            <td style="font-weight: 500;">${i.description}</td>
            <td>${i.category}</td>
            <td class="center-align">${i.quantity}</td>
            <td class="right-align">${i.unitPrice.toFixed(2)}</td>
            <td class="right-align" style="font-weight: 600;">${i.total.toFixed(2)}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>

    <div class="ledger-math">
      <div class="math-card">
        <div class="meta-row"><span class="meta-label">Subtotal:</span><span>KES ${receipt.subtotal.toFixed(2)}</span></div>
        <div class="meta-row"><span class="meta-label">Discount:</span><span style="color: #059669;">-KES ${receipt.discountTotal.toFixed(2)}</span></div>
        <div class="meta-row"><span class="meta-label">VAT Charge (16%):</span><span>KES ${receipt.taxTotal.toFixed(2)}</span></div>
        <div class="meta-row total-row"><span class="meta-label" style="color:#0d47a1;">Grand Total:</span><span>KES ${receipt.grandTotal.toFixed(2)}</span></div>
        <div class="meta-row" style="margin-top: 10px;"><span class="meta-label">Paid Amount:</span><span style="color: #059669; font-weight: bold;">KES ${receipt.amountPaid.toFixed(2)}</span></div>
        <div class="meta-row" style="background-color: #fef2f2; padding: 4px; border-radius: 4px;"><span class="meta-label">Outstanding Bal:</span><span style="color: #b91c1c; font-weight: bold;">KES ${receipt.balance.toFixed(2)}</span></div>
      </div>
    </div>

    <div class="etims-footer">
      <div style="font-weight: bold; border-bottom: 1px dashed rgba(241,245,249,0.2); padding-bottom: 4px; margin-bottom: 8px;">KRA CONTROL UNIT INFO (eTIMS SECURED)</div>
      <div>PIN: ${receipt.kraPin}</div>
      <div>Control Unit No: ${receipt.controlUnitNo}</div>
      <div>Device ID: ${receipt.fiscalDeviceNo}</div>
      <div style="color: #60a5fa; overflow-wrap: break-word;">Signature: ${receipt.receiptSignature}</div>
      <div style="font-size: 9px; color: #94a3b8; overflow-wrap: break-word;">Hash: ${receipt.invoiceHash}</div>
      <div style="margin-top: 8px; font-weight: bold;">Verification Code: ${receipt.verificationCode}</div>
    </div>

    <a href="#" class="print-btn" onclick="window.print(); return false;">Print / Action PDF</a>
  </div>
</body>
</html>
      `;

      // Trigger automatic stream saving in active frame browser context
      const fileData = new Blob([standaloneHTML], {type: 'text/html;charset=utf-8'});
      const tempLink = document.createElement('a');
      tempLink.href = URL.createObjectURL(fileData);
      tempLink.setAttribute('download', filename);
      document.body.appendChild(tempLink);
      tempLink.click();
      document.body.removeChild(tempLink);
      
      setIsDownloading(false);
    }, 1200);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      {/* Top Controller Options Panel */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm no-print flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-xl transition border border-gray-200 cursor-pointer"
            title="Go back to dashboard"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h2 className="text-md font-display font-bold text-gray-950 flex items-center gap-1.5">
              Secure Receipt Export Centre
            </h2>
            <p className="text-xs text-gray-400">
              Select paper configuration before running standard system prints.
            </p>
          </div>
        </div>

        {/* Toggle Panel & Presets */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Document Type (Receipt vs Invoice) Toggle */}
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setLayoutMode('receipt')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                layoutMode === 'receipt' 
                  ? 'bg-white text-gray-950 font-bold shadow-xs' 
                  : 'text-gray-500 hover:text-gray-900'
              }`}
              title="Official Receipt template layout"
            >
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
              Official Receipt
            </button>
            
            <button
              onClick={() => setLayoutMode('invoice')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                layoutMode === 'invoice' 
                  ? 'bg-white text-gray-950 font-bold shadow-xs' 
                  : 'text-gray-500 hover:text-gray-900'
              }`}
              title="Student Fee Invoice template layout"
            >
              <AlertCircle className="h-3.5 w-3.5 text-indigo-600" />
              Student Invoice
            </button>
          </div>

          {/* Paper presets */}
          <div className="flex flex-wrap bg-gray-100 p-1 rounded-xl">
            <button
              onClick={() => setPaperLayout('A4')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                paperLayout === 'A4' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <AppWindow className="h-4 w-4" />
              A4 Portrait
            </button>
            
            <button
              onClick={() => setPaperLayout('A4-Landscape')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                paperLayout === 'A4-Landscape' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <Laptop className="h-4 w-4" />
              A4 Landscape
            </button>

            <button
              onClick={() => setPaperLayout('80mm')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                paperLayout === '80mm' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <Smartphone className="h-4 w-4" />
              80mm Thermal Slip
            </button>
          </div>
        </div>

        {/* Core Export Triggers */}
        <div className="flex gap-2">
          {/* Simulate PDF download trigger conforming filename instructions */}
          <button
            disabled={isDownloading}
            onClick={handleSimulatePDFDownload}
            className="px-4 py-2 bg-gray-900 hover:bg-slate-800 text-white rounded-xl font-semibold text-xs flex items-center gap-1.5 transition cursor-pointer"
          >
            {isDownloading ? (
              <>
                <span className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
                Generating...
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                Download Smart PDF
              </>
            )}
          </button>

          <button
            onClick={handleNativePrint}
            className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-semibold text-xs flex items-center gap-1.5 transition shadow-sm cursor-pointer"
          >
            <Printer className="h-4 w-4" />
            Trigger Print (A4 / Device)
          </button>
        </div>
      </div>

      {/* Embedded visual guides alerting user on iframe sandboxing conditions */}
      <div className="bg-amber-50 rounded-xl p-3 border border-amber-100 flex items-start gap-2.5 text-xs text-amber-800 no-print">
        <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
        <div>
          <strong>AI Studio Iframe Sandboxing Notice:</strong> Browsers sometimes restrict <code>window.print()</code> directly inside sandbox frames. If the print dialog does not trigger, hit the <strong>"Download Smart PDF"</strong> button to save a clean standalone compliant document model.
        </div>
      </div>

      {/* --- RENDER TARGET SPACE --- */}
      <div className="flex justify-center bg-gray-50 p-6 md:p-12 rounded-3xl border border-gray-200 shadow-inner">
        
        {/* Render portrait A4 standard view */}
        {paperLayout === 'A4' && (
          <div className="bg-white px-8 md:px-12 py-10 rounded-2xl shadow-xl w-full max-w-[800px] border border-gray-100 print-container">
            <ReceiptView receipt={receipt} schoolConfig={schoolConfig} isEmbedded={true} layoutMode={layoutMode} />
          </div>
        )}

        {/* Render landscape A4 standard view */}
        {paperLayout === 'A4-Landscape' && (
          <div className="bg-white px-8 md:px-12 py-10 rounded-2xl shadow-xl w-full max-w-[1000px] border border-gray-100 print-container overflow-x-auto">
            <div className="min-w-[800px]">
              <ReceiptView receipt={receipt} schoolConfig={schoolConfig} isEmbedded={true} layoutMode={layoutMode} />
            </div>
          </div>
        )}

        {/* Render 80mm Custom Simulated Thermal Slip Receipt matching the requested official ETR exact template */}
        {paperLayout === '80mm' && (
          <div className="bg-white p-6 shadow-2xl w-[380px] border border-gray-300 font-mono text-[11px] leading-relaxed text-gray-900 print-container select-text">
            <pre className="font-mono text-[10.5px] leading-tight text-gray-900 whitespace-pre-wrap break-all select-all">
{`==========================================================
                    ROCKSIDE ACADEMY
              TAX INVOICE / ${layoutMode === 'receipt' ? 'eTIMS RECEIPT' : 'STUDENT INVOICE'}
==========================================================

School Name: ${(schoolConfig.name || "ROCKSIDE ACADEMY").toUpperCase()}
Address: ${schoolConfig.address || "P. O. Box 3735-00200, Nairobi"}
Telephone: ${schoolConfig.phone1} / ${schoolConfig.phone2}

KRA PIN: ${receipt.kraPin}
eTIMS Serial No: ${receipt.controlUnitNo}
Invoice No: ${receipt.invoiceNo}
Date: ${formatETRDate(receipt.date)}
Time: ${receipt.time}

Student Name: ${receipt.studentName || 'Not Specified'}
Grade: ${receipt.studentGrade || receipt.studentClass || '5'}
Parent/Guardian: ${receipt.parentName || 'Not Specified'}

----------------------------------------------------------
DESCRIPTION                             AMOUNT (KES)
----------------------------------------------------------
${receipt.items.map(itm => {
  const leftSide = itm.description;
  const rightSide = itm.total.toLocaleString(undefined, { minimumFractionDigits: 2 });
  const padLen = 58 - leftSide.length - rightSide.length;
  const paddingSpace = padLen > 0 ? " ".repeat(padLen) : " ";
  return `${leftSide}${paddingSpace}${rightSide}`;
}).join('\n')}
----------------------------------------------------------
${(() => {
  const leftLabel = "SUBTOTAL";
  const rightValue = receipt.subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 });
  const padLen = 58 - leftLabel.length - rightValue.length;
  const paddingSpace = padLen > 0 ? " ".repeat(padLen) : " ";
  return `${leftLabel}${paddingSpace}${rightValue}`;
})()}
${(() => {
  const leftLabel = "VAT (Exempt/Education Services)";
  const rightValue = receipt.taxTotal.toLocaleString(undefined, { minimumFractionDigits: 2 });
  const padLen = 58 - leftLabel.length - rightValue.length;
  const paddingSpace = padLen > 0 ? " ".repeat(padLen) : " ";
  return `${leftLabel}${paddingSpace}${rightValue}`;
})()}
----------------------------------------------------------
${(() => {
  const leftLabel = "TOTAL PAYABLE";
  const rightValue = receipt.grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2 });
  const padLen = 58 - leftLabel.length - rightValue.length;
  const paddingSpace = padLen > 0 ? " ".repeat(padLen) : " ";
  return `${leftLabel}${paddingSpace}${rightValue}`;
})()}
==========================================================

Payment Method: ${receipt.paymentMode.toUpperCase()}
Transaction Code: ${receipt.paymentRef || 'N/A'}

----------------------------------------------------------
KRA eTIMS INFORMATION
----------------------------------------------------------

Buyer PIN: N/A

Control Unit ID:
${receipt.controlUnitNo}

Fiscal Day Number:
FDN-${receipt.fiscalDayNo || '127845'}

Receipt Signature:
${receipt.receiptSignature}

Verification Code:
${receipt.verificationCode}

QR CODE:`}
            </pre>

            {/* Standard QR Code inline visualization conforming to requested QR CODE text anchor */}
            <div className="my-3 flex flex-col items-center gap-1.5 bg-gray-50 p-2.5 rounded-lg border border-gray-200">
              <QRCodeSVG value={buildVerificationUrl(receipt)} size={115} />
              <div className="text-[8px] text-gray-500 font-mono font-bold tracking-widest mt-1">
                VERIFICATION CODE: {receipt.verificationCode}
              </div>
            </div>

            <pre className="font-mono text-[10.5px] leading-tight text-gray-900 whitespace-pre-wrap break-all select-all">
{`Invoice Hash:
${receipt.invoiceHash}

==========================================================
THIS IS AN ELECTRONIC TAX INVOICE
GENERATED THROUGH KRA eTIMS

To verify:
Scan the QR code using KRA eTIMS App
or verify through KRA taxpayer portal.

THANK YOU FOR SUPPORTING ROCKSIDE ACADEMY
==========================================================`}
            </pre>
          </div>
        )}

      </div>
    </div>
  );
};
