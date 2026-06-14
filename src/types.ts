/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ReceiptItem {
  id: string;
  description: string;
  category: string;
  quantity: number;
  unitPrice: number;
  discount: number; // Flat discount amount
  taxRate: number; // e.g. 16 for 16% VAT, 0 for 0% or Exempt
  taxType: 'A' | 'B' | 'C' | 'D' | 'E'; // eTIMS tax categories: A = 16% VAT, B = 8%, C = 0%, D = Non-Taxable / Exempt, E = 8% VAT (or others)
  taxAmount: number;
  total: number;
}

export interface Receipt {
  id: string;
  receiptNo: string;
  invoiceNo: string;
  refNo: string;
  date: string;
  time: string;
  academicYear: string;
  term: string; // e.g., 'Term 1', 'Term 2', 'Term 3'
  
  // Student Info (Optional / Hidden per user flow)
  studentName?: string;
  admissionNo?: string;
  studentClass: string; // e.g. 'Grade 2 West', 'Grade 5 East'
  studentGrade: string; // 'Grade 2', 'Grade 5', etc.
  studentStream: string; // 'East', 'West', 'North', 'South'
  parentName: string;
  parentPhone: string;
  parentEmail: string;
  buyerName?: string;
  buyerPin?: string;
  paymentRef: string; // e.g. M-PESA Ref: QRF84HD7SF
  paymentMode: 'M-Pesa' | 'Bank Transfer' | 'Cash' | 'Cheque';
  generatedBy: string; // The username or role responsible
  
  // Items
  items: ReceiptItem[];
  
  // Calculations
  subtotal: number;
  discountTotal: number;
  taxTotal: number;
  grandTotal: number;
  amountPaid: number;
  balance: number; // GrandTotal - AmountPaid
  
  // eTIMS Compliance Fields
  kraPin: string;
  etimsInvoiceNo: string;
  controlUnitNo: string;
  fiscalDeviceNo: string;
  receiptSignature: string;
  verificationCode: string;
  invoiceHash: string;
  fiscalDayNo: number;
  transactionId: string;
  receiptUuid: string;
  status: 'Paid' | 'Approved' | 'Pending' | 'Cancelled';
  receiptImage?: string; // Base64 or image URL of payment slip/screenshot
  
  // Stamps and Signatures
  showStamp: boolean;
  bursarSignature: string | null; // Base64 or name text
  accountantSignature: string | null;
  principalSignature: string | null;
  showSignatures: boolean;
  schoolStampUrl: string | null;
}

export interface SchoolConfig {
  name: string;
  motto: string;
  logoUrl: string | null;
  schoolStampUrl?: string | null; // Digital official stamp base64 or URL
  address: string;
  postalAddress: string;
  phone1: string;
  phone2: string;
  email: string;
  website: string;
  kraPin: string;
  etimsRegNo: string;
  schoolRegNo: string;
}

export interface ProductPreset {
  id: string;
  description: string;
  category: 'School Fees' | 'Uniforms' | 'Books' | 'Activity Fee' | 'Transport' | 'Boarding' | 'Examination' | 'Miscellaneous';
  unitPrice: number;
  grade: 'Grade 2' | 'Grade 5' | 'General';
}

export type UserRole = 'Super Admin' | 'Principal' | 'Bursar' | 'Accountant' | 'Teacher' | 'Clerk';

export interface AuditLog {
  id: string;
  timestamp: string;
  role: UserRole;
  userEmail: string;
  action: string;
  receiptNo?: string;
  details: string;
}
