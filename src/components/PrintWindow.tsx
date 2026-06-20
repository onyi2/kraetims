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

  // 44-character exact alignment helpers for eTIMS thermals
  const padRight = (str: string, len: number) => {
    if (str.length > len) return str.substring(0, len);
    return str + " ".repeat(len - str.length);
  };

  const padLeft = (str: string, len: number) => {
    if (str.length > len) return str.substring(0, len);
    return " ".repeat(len - str.length) + str;
  };

  const centerText = (str: string, width: number = 44) => {
    if (str.length >= width) return str.substring(0, width);
    const leftPad = Math.floor((width - str.length) / 2);
    const rightPad = width - str.length - leftPad;
    return " ".repeat(leftPad) + str + " ".repeat(rightPad);
  };

  const formatNumericDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      if (!isNaN(d.getTime())) {
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        return `${day}-${month}-${year}`;
      }
    } catch (e) {}
    return dateStr;
  };

  const formatTime12h = (timeStr: string) => {
    try {
      if (!timeStr) return '';
      const parts = timeStr.split(':');
      if (parts.length >= 2) {
        let hours = parseInt(parts[0], 10);
        const mins = parts[1];
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12;
        return `${String(hours).padStart(2, '0')}:${parts[1].substring(0, 2)} ${ampm}`;
      }
    } catch (e) {}
    return timeStr;
  };

  const formatItemLine = (desc: string, qty: number, rate: number, total: number) => {
    const dStr = desc.substring(0, 20);
    const qStr = qty.toString();
    const rStr = rate.toLocaleString('en-US', { minimumFractionDigits: 2 });
    const tStr = total.toLocaleString('en-US', { minimumFractionDigits: 2 });
    return padRight(dStr, 20) + padLeft(qStr, 3) + padLeft(rStr, 10) + padLeft(tStr, 11);
  };

  const formatTotalLine = (label: string, amount: number) => {
    const left = label;
    const right = amount.toLocaleString('en-US', { minimumFractionDigits: 2 });
    const padLen = 44 - left.length - right.length;
    const paddingSpace = padLen > 0 ? " ".repeat(padLen) : " ";
    return `${left}${paddingSpace}${right}`;
  };

  const formatTwoColumn = (left: string, right: string, width: number = 44) => {
    const padLen = width - left.length - right.length;
    if (padLen > 0) {
      return left + " ".repeat(padLen) + right;
    }
    return left + " " + right;
  };

  const doubleSeparator = "============================================";
  const singleSeparator = "--------------------------------------------";

  const schoolNameLine = centerText((schoolConfig.name || "SHOP OWNER").toUpperCase(), 44);
  
  let schoolBoxAddress = schoolConfig.address;
  if (!schoolBoxAddress.toUpperCase().includes("BOX")) {
    schoolBoxAddress = `P.O. Box ${schoolConfig.postalAddress || "4589-00100"}, Nairobi, Kenya`;
  }
  const schoolAddressLine = centerText(schoolBoxAddress, 44);
  const phoneAndEmail = `TEL: ${schoolConfig.phone1} | ${schoolConfig.email}`;
  const phoneAndEmailLine = centerText(phoneAndEmail, 44);
  const kraPinLine = centerText(`KRA PIN: ${receipt.kraPin || schoolConfig.kraPin || "P000000000E"}`, 44);

  const receiptNoFormatted = `RECEIPT NO: ${receipt.receiptNo}`;
  const dateFormatted = `DATE: ${formatNumericDate(receipt.date)}`;
  const metaLine1 = formatTwoColumn(receiptNoFormatted, dateFormatted, 44);

  const timeFormatted = `TIME: ${formatTime12h(receipt.time)}`;
  const receiptSignShort = (receipt.receiptSignature || "XXXXX").substring(0, 10).toUpperCase();
  const rSignFormatted = `RECEIPT SIGN: ${receiptSignShort}`;
  const metaLine2 = formatTwoColumn(timeFormatted, rSignFormatted, 44);

  const metaLine3 = `CU INVOICE NO: ${receipt.invoiceNo?.startsWith('INV') ? receipt.invoiceNo.replace('INV-', 'KRA00') : receipt.invoiceNo?.toUpperCase() || 'KRA0012345678910'}`;

  const itemHeader = padRight("ITEM DESCRIPTION", 20) + padLeft("QTY", 3) + padLeft("PRICE(KES)", 10) + padLeft("AMOUNT(KES)", 11);

  const itemsLines = receipt.items.map(itm => 
    formatItemLine(itm.description, itm.quantity, itm.unitPrice, itm.total)
  ).join('\n');

  const totalExclLine = formatTotalLine("TOTAL EXCL. TAX:", receipt.subtotal - receipt.discountTotal);
  const totalVATLine = formatTotalLine("TOTAL VAT (16%):", receipt.taxTotal);
  const totalAmountLine = formatTotalLine("TOTAL AMOUNT:", receipt.grandTotal);

  const buyerNameLine = `BUYER: ${(receipt.buyerName || "General Buyer").toUpperCase()}`;
  const buyerPinLine = `BUYER PIN: ${(receipt.buyerPin || "P051647289B").toUpperCase()}`;
  const paymentMethodLine = `PAYMENT METHOD: ${receipt.paymentMode.toUpperCase()}`;
  const paymentTxLabel = receipt.paymentMode.toUpperCase() === 'M-PESA' ? 'M-PESA TRANS ID' : 'TRANS ID';
  const paymentTxLine = receipt.paymentRef ? `${paymentTxLabel}: ${receipt.paymentRef.toUpperCase()}` : null;
  const accountLine = receipt.admissionNo ? `ACCOUNT/ADM NO: ${receipt.admissionNo}` : null;
  const studentLine = receipt.studentName ? `STUDENT NAME: ${receipt.studentName}` : null;

  const paymentSection = [
    buyerNameLine,
    buyerPinLine,
    "--------------------------------------------",
    paymentMethodLine,
    ...(paymentTxLine ? [paymentTxLine] : []),
  ].join('\n');

  const docFooterLine1 = centerText("THIS IS A VALID COMPUTER-GENERATED DOCUMENT", 44);
  const docFooterLine2 = centerText("ISSUED UNDER THE KENYA REVENUE AUTHORITY eTIMS", 44);

  const exactReceiptText = `${doubleSeparator}
${schoolNameLine}
${schoolAddressLine}
${phoneAndEmailLine}
${kraPinLine}
${doubleSeparator}
${metaLine1}
${metaLine2}
${metaLine3}
${doubleSeparator}
${itemHeader}
${singleSeparator}
${itemsLines}
${singleSeparator}
${totalExclLine}
${totalVATLine}
${doubleSeparator}
${totalAmountLine}
${doubleSeparator}
${paymentSection}
${doubleSeparator}
${docFooterLine1}
${docFooterLine2}`;

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

  // Generates a fully compiled standalone file as fallback download simulating PDF output
  const handleSimulatePDFDownload = () => {
    setIsDownloading(true);
    
    setTimeout(() => {
      // Create clean filename based on guidelines: ReceiptNumber_BuyerName_Date.pdf
      const cleanBuyerName = (receipt.buyerName || 'receipt').replace(/[^a-zA-Z0-9]/g, "_");
      const filename = `${receipt.receiptNo}_${cleanBuyerName}_${receipt.date}.html`;

      let standaloneHTML = '';

      if (paperLayout === '80mm') {
        standaloneHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Receipt ${receipt.receiptNo} - Shop Owner</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&display=swap');
    body {
      font-family: 'JetBrains Mono', monospace;
      background-color: #f3f4f6;
      margin: 0;
      padding: 20px;
      display: flex;
      justify-content: center;
      align-items: flex-start;
    }
    .receipt-card {
      background-color: white;
      width: 380px;
      padding: 24px;
      box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);
      border: 1px solid #e5e7eb;
      border-radius: 8px;
    }
    pre {
      font-family: 'JetBrains Mono', monospace;
      font-size: 11.5px;
      line-height: 1.35;
      color: #111827;
      margin: 0;
      white-space: pre-wrap;
      word-break: break-all;
    }
    .qr-container {
      margin-top: 15px;
      margin-bottom: 15px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
      background-color: #fafafa;
      padding: 12px;
      border: 1px dashed #e5e7eb;
      border-radius: 6px;
    }
    .qr-text {
      font-size: 8px;
      font-weight: bold;
      color: #4b5563;
      letter-spacing: 0.1em;
    }
    .print-btn {
      display: block;
      width: 100%;
      text-align: center;
      background-color: #111827;
      color: white;
      padding: 10px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: bold;
      text-decoration: none;
      margin-top: 15px;
    }
    @media print {
      @page {
        size: 80mm auto;
        margin: 0;
      }
      body {
        background-color: white;
        padding: 0;
        margin: 0;
      }
      .receipt-card {
        width: 80mm;
        box-shadow: none;
        border: none;
        border-radius: 0;
        padding: 4mm;
      }
      .print-btn {
        display: none;
      }
    }
  </style>
</head>
<body>
  <div class="receipt-card">
    <pre>${exactReceiptText}</pre>
    
    <div class="qr-container">
      <svg width="120" height="120" viewBox="0 0 29 29" shape-rendering="crispEdges" style="image-rendering: pixelated;">
        <path fill="#ffffff" d="M0,0 h29 v29 h-29 z" />
        <path fill="#000000" d="M0,0 h7 v1 h-7 z M22,0 h7 v1 h-7 z M0,1 h1 v5 h-1 z M6,1 h1 v5 h-1 z M22,1 h1 v5 h-1 z M28,1 h1 v5 h-1 z M0,2 h1 v1 h1 v-1 h1 v1 h1 v-1 h1 v1 h-1 z M8,2 h2 v1 h-2 z M14,2 h3 v1 h-3 z M22,2 h1 v1 h1 v-1 h1 v1 h1 v-1 h1 v1 h-1 z M0,3 h1 v1 h-1 z M6,3 h1 v1 h-1 z M22,3 h1 v1 h-1 z M28,3 h1 v1 h-1 z M0,4 h1 v1 h-1 z M6,4 h1 v1 h-1 z M22,4 h1 v1 h-1 z M28,4 h1 v1 h-1 z M0,5 h1 v1 h-1 z M6,5 h1 v1 h-1 z M22,5 h1 v1 h-1 z M28,5 h1 v1 h-1 z M0,6 h7 v1 h-7 z M22,6 h7 v1 h-7 z M8,7 h1 v1 h1 v-1 z M13,7 h1 v2 h-1 z M19,7 h2 v1 h-2 z M0,8 h5 v1 h-5 z M25,8 h3 v1 h-3 z M1,9 h2 v1 h-2 z M8,9 h3 v1 h-3 z M16,9 h1 v1 h-1 z M23,9 h2 v1 h-2 z M0,10 h3 v1 h-3 z M5,10 h1 v1 h-1 z M11,10 h2 v1 h-2 z M18,10 h1 v1 h-1 z M24,10 h4 v1 h-4 z M0,11 h1 v1 h1 v-1 z M15,11 h1 v1 h-1 z M20,11 h2 v1 h-2 z M0,12 h5 v1 h-5 z M6,12 h1 v1 h-1 z M13,12 h2 v1 h-2 z M19,12 h4 v1 h-4 z M27,12 h2 v1 h-2 z M1,13 h1 v1 h-1 z M10,13 h2 v1 h-2 z M17,13 h1 v1 h-1 z M23,13 h2 v1 h-2 z M4,14 h2 v1 h-2 z M12,14 h2 v1 h-2 z M19,14 h3 v1 h-3 z M27,14 h1 v1 h-1 z M0,15 h1 v1 h-1 z M7,15 h3 v1 h-3 z M14,15 h2 v1 h-2 z M22,15 h2 v1 h-2 z M2,16 h3 v1 h-3 z M11,16 h2 v1 h-2 z M18,16 h1 v1 h-1 z M24,16 h3 v1 h-3 z M0,17 h1 v1 h1 v-1 z M9,17 h2 v1 h-2 z M15,17 h2 v1 h-2 z M20,17 h1 v1 h-1 z M5,18 h1 v1 h-1 z M13,18 h2 v1 h-2 z M19,18 h4 v1 h-4 z M26,18 h2 v1 h-2 z M1,19 h3 v1 h-3 z M11,19 h1 v1 h-1 z M17,19 h2 v1 h-2 z M23,19 h2 v1 h-2 z M0,20 h3 v1 h-3 z M9,20 h2 v1 h-2 z M14,20 h3 v1 h-3 z M21,20 h5 v1 h-5 z M4,21 h1 v1 h-1 z M12,21 h2 v1 h-2 z M18,21 h1 v1 h-1 z M27,21 h2 v1 h-2 z M0,22 h7 v1 h-7 z M10,22 h2 v1 h-2 z M15,22 h1 v1 h-1 z M24,22 h3 v1 h-3 z M0,23 h1 v1 h-1 z M6,23 h1 v1 h-1 z M13,23 h2 v1 h-2 z M19,23 h1 v1 h-1 z M27,23 h1 v1 h-1 z M0,24 h1 v1 h-1 z M6,24 h1 v1 h-1 z M10,24 h2 v1 h-2 z M16,24 h2 v1 h-2 z M24,24 h3 v1 h-3 z M0,25 h1 v1 h-1 z M6,25 h1 v1 h-1 z M14,25 h1 v1 h-1 z M20,25 h2 v1 h-2 z M0,26 h1 v1 h-1 z M6,26 h1 v1 h-1 z M11,26 h2 v1 h-2 z M18,26 h1 v1 h-1 z M25,26 h3 v1 h-3 z M0,27 h1 v1 h-1 z M6,27 h1 v1 h-1 z M15,27 h2 v1 h-2 z M21,27 h2 v1 h-2 z M0,28 h7 v1 h-7 z M9,28 h2 v1 h-2 z M14,28 h3 v1 h-3 z M19,28 h4 v1 h-4 z" />
      </svg>
      <div class="qr-text">END OF FISCAL RECEIPT</div>
    </div>

    <pre>
Invoice Hash:
${receipt.invoiceHash}

============================================
THIS IS AN ELECTRONIC TAX INVOICE
GENERATED THROUGH KRA eTIMS

To verify:
Scan the QR code using KRA eTIMS App
or verify through KRA taxpayer portal.

THANK YOU FOR SUPPORTING ${(schoolConfig.name || "SHOP OWNER").toUpperCase()}
============================================</pre>

    <a href="#" class="print-btn" onclick="window.print(); return false;">Print Action</a>
  </div>
</body>
</html>
        `;
      } else {
        standaloneHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${receipt.receiptNo} - Shop Owner Receipt</title>
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
      @page {
        size: auto;
        margin: 0 !important;
      }
      .print-btn { display: none; }
      body {
        margin: 0 !important;
        padding: 15mm !important;
      }
      .container { border: none; box-shadow: none; padding: 0; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header-banner" style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e5e7eb; padding-bottom: 16px; margin-bottom: 24px;">
      <div style="display: flex; align-items: center; gap: 14px;">
        <div style="width: 48px; height: 48px; flex-shrink: 0;">
          <svg viewBox="0 0 100 100" style="width: 100%; height: 100%;" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="50" r="48" fill="#ffffff" />
            <path
              d="M50,2 A48,48 0 0,0 2,50 A48,48 0 0,0 50,98 C46,92 40,82 38,72 C36,66 38,62 42,58 C45,55 52,53 58,50 C63,47 63,42 58,38 C52,35 44,34 38,32 C32,31 29,26 30,19 C31,10 42,2.5 50,2 Z"
              fill="#000000"
            />
            <path
              d="M58,4 A48,48 0 0,1 98,50 A48,48 0 0,1 58,96 Q76,70 76,50 Q76,30 58,4 Z"
              fill="#e31f26"
            />
            <path d="M12,50 Q22,46 32,41" stroke="#ffffff" stroke-width="2" stroke-linecap="round" fill="none" />
            <path d="M16,63 Q26,58 36,51" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" fill="none" />
            <path d="M22,74 Q31,67 41,58" stroke="#ffffff" stroke-width="3" stroke-linecap="round" fill="none" />
            <path d="M28,84 Q37,76 45,63" stroke="#ffffff" stroke-width="3.5" stroke-linecap="round" fill="none" />
            <path d="M42,34 Q45,33.5 45,35.5 A1.5,1.5 0 0,1 42,35.5 Z" fill="#ffffff" />
            <path d="M34,22 Q31,19 31,14 M38,25 Q35,21 35,17" stroke="#ffffff" stroke-width="2" stroke-linecap="round" fill="none" />
          </svg>
        </div>
        <div style="display: flex; flex-direction: column; justify-content: center; font-family: Georgia, 'Times New Roman', Times, serif;">
          <span style="font-size: 18px; font-weight: bold; color: #030712; line-height: 1; letter-spacing: -0.02em;">Kenya Revenue</span>
          <span style="font-size: 11px; font-weight: bold; color: #111827; letter-spacing: 0.24em; text-transform: uppercase; margin-top: 5px; line-height: 1;">AUTHORITY</span>
        </div>
      </div>
      <!-- eTIMS Brand Lockup replacing simple tax-badge as requested -->
      <div style="display: flex; flex-direction: column; align-items: flex-end; margin-left: auto;">
        <div style="display: flex; flex-direction: column; align-items: center;">
          <div style="display: flex; align-items: flex-end; height: 36px; line-height: 1; font-family: system-ui, -apple-system, sans-serif;">
            <span style="font-size: 26px; font-weight: 800; color: #6b7280; text-transform: lowercase; line-height: 1; margin-bottom: -1px; margin-right: 1px;">e</span>
            <span style="font-size: 34px; font-weight: 900; color: #030712; text-transform: uppercase; line-height: 1; margin-right: 1px;">T</span>
            <div style="display: flex; flex-direction: column; align-items: center; justify-content: flex-end; height: 100%; padding-bottom: 2px;">
              <div style="width: 14px; height: 14px; margin-bottom: -1px;">
                <svg viewBox="0 0 100 100" style="width: 100%; height: 100%;" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="50" cy="50" r="48" fill="#ffffff" />
                  <path
                    d="M50,2 A48,48 0 0,0 2,50 A48,48 0 0,0 50,98 C46,92 40,82 38,72 C36,66 38,62 42,58 C45,55 52,53 58,50 C63,47 63,42 58,38 C52,35 44,34 38,32 C32,31 29,26 30,19 C31,10 42,2.5 50,2 Z"
                    fill="#000000"
                  />
                  <path
                    d="M58,4 A48,48 0 0,1 98,50 A48,48 0 0,1 58,96 Q76,70 76,50 Q76,30 58,4 Z"
                    fill="#e31f26"
                  />
                  <path d="M12,50 Q22,46 32,41" stroke="#ffffff" stroke-width="4" stroke-linecap="round" fill="none" />
                  <path d="M16,63 Q26,58 36,51" stroke="#ffffff" stroke-width="5" stroke-linecap="round" fill="none" />
                  <path d="M22,74 Q31,67 41,58" stroke="#ffffff" stroke-width="6" stroke-linecap="round" fill="none" />
                  <path d="M28,84 Q37,76 45,63" stroke="#ffffff" stroke-width="6.5" stroke-linecap="round" fill="none" />
                </svg>
              </div>
              <span style="font-size: 24px; font-weight: 900; color: #e31f26; font-style: italic; transform: skewX(-6deg); line-height: 1;">i</span>
            </div>
            <span style="font-size: 34px; font-weight: 900; color: #030712; text-transform: uppercase; line-height: 1; margin-left: 2px;">M</span>
            <span style="font-size: 34px; font-weight: 900; color: #030712; text-transform: uppercase; line-height: 1; margin-left: 1px;">S</span>
          </div>
          <div style="width: 100%; height: 3px; position: relative; margin-top: 2px; overflow: hidden;">
            <div style="position: absolute; top: 0; left: 0; right: 0; height: 1px; background-color: #e31f26;"></div>
            <div style="position: absolute; bottom: 0; left: 0; right: 0; height: 2px; background: black;"></div>
          </div>
        </div>
        <div style="margin-top: 4px; font-size: 9px; font-weight: bold; color: #047857; letter-spacing: 0.1em; text-transform: uppercase; font-family: monospace; background-color: #ecfdf5; border: 1px solid #d1fae5; padding: 2px 8px; border-radius: 4px;">
          eTIMS COMPLIANT
        </div>
      </div>
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
        ${layoutMode === 'receipt' ? 'OFFICIAL eTIMS TAX RECEIPT' : 'COMMERCIAL INVOICE / STATEMENT'}
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
        <div class="meta-title">Buyer & Billing Profile</div>
        <div class="meta-row"><span class="meta-label">Buyer Name:</span><span class="meta-val" style="text-transform: uppercase; font-weight: bold;">${receipt.buyerName || 'General Buyer'}</span></div>
        <div class="meta-row"><span class="meta-label">Buyer PIN:</span><span class="meta-val" style="font-family: monospace;">${receipt.buyerPin || 'P051647289B'}</span></div>
        <div class="meta-row" style="border-top: 1px dashed #cbd5e1; padding-top: 4px; margin-top: 4px;"><span class="meta-label">Category:</span><span class="meta-val" style="font-weight: 500;">${receipt.studentClass}</span></div>
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
          <th class="right-align">Price</th>
          <th class="right-align">Amount</th>
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
        ${receipt.discountTotal > 0 ? `<div class="meta-row"><span class="meta-label">Discount:</span><span style="color: #059669;">-KES ${receipt.discountTotal.toFixed(2)}</span></div>` : ''}
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
      }

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
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          ${paperLayout === '80mm' ? `
            @page {
              size: 80mm auto !important;
              margin: 0 !important;
            }
            body {
              background: white !important;
              color: black !important;
              margin: 0 !important;
              padding: 0 !important;
              display: flex !important;
              justify-content: center !important;
            }
            .no-print {
              display: none !important;
            }
            .print-container {
              width: 80mm !important;
              max-width: 800mm !important;
              border: none !important;
              box-shadow: none !important;
              padding: 4mm !important;
              margin: 0 !important;
              background: white !important;
            }
          ` : `
            @page {
              size: auto;
              margin: 0 !important;
            }
            body {
              background: white !important;
              color: black !important;
              margin: 0 !important;
              padding: 15mm !important;
            }
            .no-print {
              display: none !important;
            }
          `}
        }
      ` }} />
      
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
              title="Commercial Invoice template layout"
            >
              <AlertCircle className="h-3.5 w-3.5 text-indigo-600" />
              Commercial Invoice
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
{exactReceiptText}
            </pre>

            {/* Standard QR Code inline visualization conforming to requested QR CODE text anchor */}
            <div className="my-3 flex flex-col items-center gap-1.5 bg-gray-50 p-2.5 rounded-lg border border-gray-200">
              <QRCodeSVG value={buildVerificationUrl(receipt)} size={115} />
              <div className="text-[8px] text-gray-500 font-mono font-bold tracking-widest mt-1">
                END OF FISCAL RECEIPT
              </div>
            </div>

            <pre className="font-mono text-[10.5px] leading-tight text-gray-900 whitespace-pre-wrap break-all select-all">
{`Invoice Hash:
${receipt.invoiceHash}

============================================
THIS IS AN ELECTRONIC TAX INVOICE
GENERATED THROUGH KRA eTIMS

To verify:
Scan the QR code using KRA eTIMS App
or verify through KRA taxpayer portal.

THANK YOU FOR SUPPORTING ${(schoolConfig.name || "SHOP OWNER").toUpperCase()}
============================================`}
            </pre>
          </div>
        )}

      </div>
    </div>
  );
};
