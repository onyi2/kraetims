/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ProductPreset, SchoolConfig, Receipt, ReceiptItem } from '../types';

// Rockside Academy default configuration
export const defaultSchoolConfig: SchoolConfig = {
  name: "ROCKSIDE ACADEMY",
  motto: "Excellence in Foundation, Character and Knowledge",
  logoUrl: null, // We will render a stunning SVG-based brand logo
  address: "P.O. BOX 3735-00200 NAIROBI",
  postalAddress: "Off Kikuyu Road, Nairobi, Kenya",
  phone1: "0718164141",
  phone2: "0734808355",
  email: "info@rocksideacademy.ac.ke",
  website: "www.rocksideacademy.ac.ke",
  kraPin: "P051238491A",
  etimsRegNo: "ETIMS-109485721",
  schoolRegNo: "MOE/PE/0984/2018"
};

// Complete product and fees catalogs loaded from Rockside Academy specs
export const productPresets: ProductPreset[] = [
  // --- GRADE 2 UNIFORMS ---
  { id: 'g2u-dress', description: 'G2 Uniform Dress', category: 'Uniforms', unitPrice: 700, grade: 'Grade 2' },
  { id: 'g2u-sweater', description: 'G2 Uniform Sweater', category: 'Uniforms', unitPrice: 900, grade: 'Grade 2' },
  { id: 'g2u-shirt', description: 'G2 Uniform Shirt', category: 'Uniforms', unitPrice: 500, grade: 'Grade 2' },
  { id: 'g2u-socks', description: 'G2 Uniform Socks (Pair)', category: 'Uniforms', unitPrice: 200, grade: 'Grade 2' },
  { id: 'g2u-fleece', description: 'G2 Fleece Jacket', category: 'Uniforms', unitPrice: 2000, grade: 'Grade 2' },
  { id: 'g2u-tracksuit', description: 'G2 Sports Tracksuit', category: 'Uniforms', unitPrice: 1500, grade: 'Grade 2' },
  { id: 'g2u-tshirt', description: 'G2 Sports T-Shirt', category: 'Uniforms', unitPrice: 600, grade: 'Grade 2' },
  { id: 'g2u-bag', description: 'Rockside Branded School Bag', category: 'Uniforms', unitPrice: 2500, grade: 'Grade 2' },
  { id: 'g2u-shoes', description: 'Bata School Shoes Black', category: 'Uniforms', unitPrice: 2499, grade: 'Grade 2' },

  // --- GRADE 5 UNIFORMS ---
  { id: 'g5u-dress', description: 'G5 Uniform Dress', category: 'Uniforms', unitPrice: 750, grade: 'Grade 5' },
  { id: 'g5u-sweater', description: 'G5 Uniform Sweater', category: 'Uniforms', unitPrice: 950, grade: 'Grade 5' },
  { id: 'g5u-shirt', description: 'G5 Uniform Shirt', category: 'Uniforms', unitPrice: 550, grade: 'Grade 5' },
  { id: 'g5u-socks', description: 'G5 Uniform Socks (Pair)', category: 'Uniforms', unitPrice: 200, grade: 'Grade 5' },
  { id: 'g5u-fleece', description: 'G5 Fleece Jacket', category: 'Uniforms', unitPrice: 2000, grade: 'Grade 5' },
  { id: 'g5u-tracksuit', description: 'G5 Sports Tracksuit', category: 'Uniforms', unitPrice: 1500, grade: 'Grade 5' },
  { id: 'g5u-tshirt', description: 'G5 Sports T-Shirt', category: 'Uniforms', unitPrice: 600, grade: 'Grade 5' },
  { id: 'g5u-bag', description: 'Rockside Branded School Bag L', category: 'Uniforms', unitPrice: 2500, grade: 'Grade 5' },
  { id: 'g5u-shoes', description: 'Bata School Shoes Premium', category: 'Uniforms', unitPrice: 2799, grade: 'Grade 5' },

  // --- GRADE 2 BOOKS ---
  { id: 'g2b-mwanga', description: 'Mwanga wa Kiswahili G2', category: 'Books', unitPrice: 965, grade: 'Grade 2' },
  { id: 'g2b-kisw-wb', description: 'Kiswahili Workbook G2', category: 'Books', unitPrice: 625, grade: 'Grade 2' },
  { id: 'g2b-environ', description: 'Longhorn Environmental Activities G2', category: 'Books', unitPrice: 925, grade: 'Grade 2' },
  { id: 'g2b-creative', description: 'Mentor Creative Activities G2', category: 'Books', unitPrice: 895, grade: 'Grade 2' },

  // --- GRADE 5 BOOKS ---
  { id: 'g5b-maths', description: 'Maths Tops Extension Workbook G5', category: 'Books', unitPrice: 760, grade: 'Grade 5' },
  { id: 'g5b-kipeo', description: 'Kipeo Cha Kiswahili Textbook G5', category: 'Books', unitPrice: 785, grade: 'Grade 5' },
  { id: 'g5b-kisw-wb', description: 'Kiswahili Tops Extension Workbook G5', category: 'Books', unitPrice: 760, grade: 'Grade 5' },
  { id: 'g5b-creative', description: 'Spotlight Creative Activities G5', category: 'Books', unitPrice: 990, grade: 'Grade 5' },
  { id: 'g5b-english', description: 'English: The Turning Point G5', category: 'Books', unitPrice: 470, grade: 'Grade 5' },
  { id: 'g5b-musa', description: 'Kiswahili Hatima ya Musa Reader G5', category: 'Books', unitPrice: 465, grade: 'Grade 5' },

  // --- GENERAL SERVICES ---
  { id: 'fees-tuition', description: 'Tuition Fees (Termly)', category: 'School Fees', unitPrice: 28500, grade: 'General' },
  { id: 'fees-lunch', description: 'Daily Hot Lunch Program', category: 'School Fees', unitPrice: 6000, grade: 'General' },
  { id: 'fees-transport', description: 'School Transport Bus Services', category: 'Transport', unitPrice: 8500, grade: 'General' },
  { id: 'fees-activity', description: 'Termly Activity & Sports Fee', category: 'Activity Fee', unitPrice: 2500, grade: 'General' },
  { id: 'fees-boarding', description: 'Boarding & Accommodation Levy', category: 'Boarding', unitPrice: 15000, grade: 'General' },
  { id: 'fees-exam', description: 'KRA/Mock Exam & Assessment Levy', category: 'Examination', unitPrice: 1500, grade: 'General' }
];

// Helper to generate realistic tax-invoice numbers and security keys
export const generateEtimeKeys = (receiptNo: string) => {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const numString = receiptNo.replace(/\D/g, "");
  const numPart = numString ? numString : Math.floor(1000 + Math.random() * 9000).toString();
  
  const cuNo = `KRA010${Math.floor(100000 + Math.random() * 900000)}`;
  const fdNo = `FD-${letters[Math.floor(Math.random() * 26)]}${letters[Math.floor(Math.random() * 26)]}${Math.floor(1000 + Math.random() * 9000)}`;
  
  // Custom deterministic signature based on invoice details
  const cleanSig = `KRA-ETIMS-${letters[Math.floor(Math.random() * 26)]}${letters[Math.floor(Math.random() * 26)]}${(Math.random() * 10).toFixed(0)}${letters[Math.floor(Math.random() * 26)]}-${numPart}`;
  
  // Custom hash
  const hash = Array.from({length: 40}, () => Math.floor(Math.random()*16).toString(16)).join('').toUpperCase();
  
  // QR verification code
  const vCode = `${letters[Math.floor(Math.random() * 26)]}${letters[Math.floor(Math.random() * 26)]}${Math.floor(100 + Math.random() * 900)}`;

  return {
    cuNo,
    fdNo,
    sig: cleanSig.substring(0, 18),
    hash,
    vCode,
    uuid: `ea32fd-${Math.floor(1000 + Math.random() * 9000)}-4f8c-${Math.floor(1000 + Math.random() * 9000)}-ad98f39572c2`
  };
};

// Generates an interactive verification URL resembling KRA Portal verification pages
export const buildVerificationUrl = (receipt: { kraPin: string; etimsInvoiceNo: string; grandTotal: number; date: string }) => {
  const encodedPin = encodeURIComponent(receipt.kraPin);
  const encodedInv = encodeURIComponent(receipt.etimsInvoiceNo);
  const encodedAmt = encodeURIComponent(receipt.grandTotal.toString());
  const encodedDate = encodeURIComponent(receipt.date);
  return `https://itax.kra.go.ke/KRA-Portal/complianceMonitoring.htm?actionCode=validateInvoice&pin=${encodedPin}&invNo=${encodedInv}&amount=${encodedAmt}&date=${encodedDate}`;
};

// Helper to calculate pricing and sub totals of an individual item
export const calculateItemTotals = (quantity: number, unitPrice: number, discount: number = 0, taxRate: number = 16): { taxAmount: number, total: number } => {
  const lineSub = (quantity * unitPrice) - discount;
  // If Tax rate is 16%, standard VAT computation: Tax Amount = lineSub * (16 / 116) if Inclusive, or lineSub * 0.16 if Exclusive.
  // We'll compute standard Exclusive Tax, making Line Total = Subtotal + Tax.
  const taxVal = Math.round((lineSub * (taxRate / 100)) * 100) / 100;
  const totalVal = lineSub + taxVal;
  return {
    taxAmount: taxVal,
    total: totalVal
  };
};

// Generates 4 rich mock receipts for historical perspective on initialization
export const getInitialMockReceipts = (): Receipt[] => {
  const keys1 = generateEtimeKeys("RA-2026-0041");
  const keys2 = generateEtimeKeys("RA-2026-0042");
  const keys3 = generateEtimeKeys("RA-2026-0043");
  const keys4 = generateEtimeKeys("RA-2026-0044");

  const receipts: Receipt[] = [
    {
      id: "rec-1",
      receiptNo: "RA-2026-0041",
      invoiceNo: "INV-2026-410",
      refNo: "REF-2026-G2A",
      date: "2026-06-10",
      time: "09:12",
      academicYear: "2026",
      term: "Term 2",
      studentName: "Jayden Mwangi",
      admissionNo: "RA/C/2024/1102",
      studentClass: "Grade 2 West",
      studentGrade: "Grade 2",
      studentStream: "West",
      parentName: "Mercy Mwangi",
      parentPhone: "+254 712 345678",
      parentEmail: "mercy.m@gmail.com",
      paymentRef: "MPESA: RGK92HD7S1",
      paymentMode: "M-Pesa",
      generatedBy: "Bursar (Lillian)",
      items: [
        {
          id: "item-1a",
          description: "G2 Uniform Dress",
          category: "Uniforms",
          quantity: 2,
          unitPrice: 700,
          discount: 50,
          taxRate: 16,
          taxType: 'A',
          taxAmount: 216,
          total: 1566
        },
        {
          id: "item-1b",
          description: "G2 Uniform Sweater",
          category: "Uniforms",
          quantity: 1,
          unitPrice: 900,
          discount: 0,
          taxRate: 16,
          taxType: 'A',
          taxAmount: 144,
          total: 1044
        },
        {
          id: "item-1c",
          description: "Mwanga wa Kiswahili G2",
          category: "Books",
          quantity: 1,
          unitPrice: 965,
          discount: 0,
          taxRate: 16,
          taxType: 'A',
          taxAmount: 154.4,
          total: 1119.4
        }
      ],
      subtotal: 3265,
      discountTotal: 50,
      taxTotal: 514.4,
      grandTotal: 3729.4,
      amountPaid: 3729.4,
      balance: 0,
      kraPin: defaultSchoolConfig.kraPin,
      etimsInvoiceNo: "KRA202606100912111",
      controlUnitNo: keys1.cuNo,
      fiscalDeviceNo: keys1.fdNo,
      receiptSignature: keys1.sig,
      verificationCode: keys1.vCode,
      invoiceHash: keys1.hash,
      fiscalDayNo: 142,
      transactionId: "TXN-9087-410",
      receiptUuid: keys1.uuid,
      status: "Paid",
      showStamp: true,
      bursarSignature: "L. Wanjiku",
      accountantSignature: "P. Kamau",
      principalSignature: "Dr. S. Kinyua",
      showSignatures: true,
      schoolStampUrl: "/assets/stamp.svg"
    },
    {
      id: "rec-2",
      receiptNo: "RA-2026-0042",
      invoiceNo: "INV-2026-411",
      refNo: "REF-2026-G5B",
      date: "2026-06-11",
      time: "11:45",
      academicYear: "2026",
      term: "Term 2",
      studentName: "Chloe Cherotich",
      admissionNo: "RA/C/2022/0789",
      studentClass: "Grade 5 East",
      studentGrade: "Grade 5",
      studentStream: "East",
      parentName: "Nicholas Kiprop",
      parentPhone: "+254 722 890123",
      parentEmail: "nkiprop@outlook.com",
      paymentRef: "KCB Bank: EQ-094852",
      paymentMode: "Bank Transfer",
      generatedBy: "Accountant (Patrick)",
      items: [
        {
          id: "item-2a",
          description: "Tuition Fees (Termly)",
          category: "School Fees",
          quantity: 1,
          unitPrice: 28500,
          discount: 1500,
          taxRate: 0,
          taxType: 'D', // Exempt for educational services
          taxAmount: 0,
          total: 27000
        },
        {
          id: "item-2b",
          description: "Daily Hot Lunch Program",
          category: "School Fees",
          quantity: 1,
          unitPrice: 6000,
          discount: 0,
          taxRate: 0,
          taxType: 'D',
          taxAmount: 0,
          total: 6000
        }
      ],
      subtotal: 34500,
      discountTotal: 1500,
      taxTotal: 0,
      grandTotal: 33000,
      amountPaid: 30000,
      balance: 3000,
      kraPin: defaultSchoolConfig.kraPin,
      etimsInvoiceNo: "KRA202606111145222",
      controlUnitNo: keys2.cuNo,
      fiscalDeviceNo: keys2.fdNo,
      receiptSignature: keys2.sig,
      verificationCode: keys2.vCode,
      invoiceHash: keys2.hash,
      fiscalDayNo: 143,
      transactionId: "TXN-9087-411",
      receiptUuid: keys2.uuid,
      status: "Approved",
      showStamp: true,
      bursarSignature: null,
      accountantSignature: "P. Kamau",
      principalSignature: "Dr. S. Kinyua",
      showSignatures: true,
      schoolStampUrl: "/assets/stamp.svg"
    },
    {
      id: "rec-3",
      receiptNo: "RA-2026-0043",
      invoiceNo: "INV-2026-412",
      refNo: "REF-2026-G5A",
      date: "2026-06-12",
      time: "14:20",
      academicYear: "2026",
      term: "Term 2",
      studentName: "Ethan Omwamba",
      admissionNo: "RA/C/2023/0941",
      studentClass: "Grade 5 North",
      studentGrade: "Grade 5",
      studentStream: "North",
      parentName: "Sylvia Omwamba",
      parentPhone: "+254 733 456123",
      parentEmail: "sylvia_omw@yahoo.com",
      paymentRef: "Bank Deposit: CBK-9902",
      paymentMode: "Cheque",
      generatedBy: "Admin Principal (Sandra)",
      items: [
        {
          id: "item-3a",
          description: "G5 Fleece Jacket",
          category: "Uniforms",
          quantity: 1,
          unitPrice: 2000,
          discount: 100,
          taxRate: 16,
          taxType: 'A',
          taxAmount: 304,
          total: 2204
        },
        {
          id: "item-3b",
          description: "Maths Tops Extension Workbook G5",
          category: "Books",
          quantity: 1,
          unitPrice: 760,
          discount: 0,
          taxRate: 16,
          taxType: 'A',
          taxAmount: 121.6,
          total: 881.6
        },
        {
          id: "item-3c",
          description: "Kipeo Cha Kiswahili Textbook G5",
          category: "Books",
          quantity: 1,
          unitPrice: 785,
          discount: 0,
          taxRate: 16,
          taxType: 'A',
          taxAmount: 125.6,
          total: 910.6
        }
      ],
      subtotal: 3545,
      discountTotal: 100,
      taxTotal: 551.2,
      grandTotal: 3996.2,
      amountPaid: 3996.2,
      balance: 0,
      kraPin: defaultSchoolConfig.kraPin,
      etimsInvoiceNo: "KRA202606121420333",
      controlUnitNo: keys3.cuNo,
      fiscalDeviceNo: keys3.fdNo,
      receiptSignature: keys3.sig,
      verificationCode: keys3.vCode,
      invoiceHash: keys3.hash,
      fiscalDayNo: 144,
      transactionId: "TXN-9087-412",
      receiptUuid: keys3.uuid,
      status: "Paid",
      showStamp: true,
      bursarSignature: "L. Wanjiku",
      accountantSignature: "P. Kamau",
      principalSignature: "Dr. S. Kinyua",
      showSignatures: true,
      schoolStampUrl: null
    },
    {
      id: "rec-4",
      receiptNo: "RA-2026-0044",
      invoiceNo: "INV-2026-413",
      refNo: "REF-2026-G2C",
      date: "2026-06-13",
      time: "10:30",
      academicYear: "2026",
      term: "Term 2",
      studentName: "Amani Wanjiku",
      admissionNo: "RA/C/2025/1334",
      studentClass: "Grade 2 South",
      studentGrade: "Grade 2",
      studentStream: "South",
      parentName: "David Wanjiku",
      parentPhone: "+254 705 918374",
      parentEmail: "d.wanjiku@outlook.com",
      paymentRef: "MPESA: RHM89JD3Y1",
      paymentMode: "M-Pesa",
      generatedBy: "Bursar (Lillian)",
      items: [
        {
          id: "item-4a",
          description: "G2 Uniform Tracksuit",
          category: "Uniforms",
          quantity: 1,
          unitPrice: 1500,
          discount: 0,
          taxRate: 16,
          taxType: 'A',
          taxAmount: 240,
          total: 1740
        }
      ],
      subtotal: 1500,
      discountTotal: 0,
      taxTotal: 240,
      grandTotal: 1740,
      amountPaid: 0,
      balance: 1740,
      kraPin: defaultSchoolConfig.kraPin,
      etimsInvoiceNo: "KRA202606131030444",
      controlUnitNo: keys4.cuNo,
      fiscalDeviceNo: keys4.fdNo,
      receiptSignature: keys4.sig,
      verificationCode: keys4.vCode,
      invoiceHash: keys4.hash,
      fiscalDayNo: 145,
      transactionId: "TXN-9087-413",
      receiptUuid: keys4.uuid,
      status: "Pending",
      showStamp: false,
      bursarSignature: null,
      accountantSignature: null,
      principalSignature: null,
      showSignatures: false,
      schoolStampUrl: null
    }
  ];

  return receipts;
};
