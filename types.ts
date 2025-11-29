export type Role = 'ADMIN_OPS' | 'ADMIN_FINANCE';

export interface User {
  id: string;
  username: string;
  role: Role;
  name: string;
}

export type View = 'DASHBOARD' | 'VENDORS' | 'CLIENTS' | 'ASSETS' | 'PROJECTS' | 'ANALYTICS';

export enum Importance {
  CRITICAL = 'Critical', // Rent, Security, Electricity
  HIGH = 'High',
  MEDIUM = 'Medium',
  LOW = 'Low',
  HOLD = 'Hold', // Special status to pause payment
}

export enum InvoiceStatus {
  APPROVED = 'Approved',
  HOLD = 'Hold',
  PAID = 'Paid',
}

// Vendor Bills (AP)
export interface VendorInvoice {
  id: string;
  vendorName: string;
  category: 'Utilities' | 'Rent' | 'Security' | 'Services' | 'Tax';
  invoiceDate: string; 
  dueDate: string; 
  amount: number;
  importance: Importance;
  status: InvoiceStatus;
  
  // Calculated
  score?: number;
  ageDays?: number;
  isManualOverride?: boolean;
}

// Client Invoices (AR)
export interface ClientInvoice {
  id: string;
  clientId: string;
  clientName: string;
  description: string;
  amount: number;
  invoiceDate: string;
  dueDate: string;
  status: 'Draft' | 'Sent' | 'Paid' | 'Overdue';
  isReceiptIssued: boolean;
  source: 'Internal' | 'External_Scan';
}

export interface Client {
  id: string;
  name: string;
  email: string;
  officeNumber: string;
  contractStart: string;
  contractEnd: string;
  status: 'Active' | 'Churned';
}

export interface Asset {
  id: string; // Unique Asset ID
  name: string;
  category: 'Furniture' | 'Electronics' | 'Supplies' | 'Infrastructure';
  purchaseDate: string;
  value: number;
  location: string;
}

export interface Project {
  id: string;
  name: string; 
  clientName: string; // If applicable
  contractValue: number;
  contactPerson: string;
  startDate: string;
  endDate: string; // Duration calculated from dates
  status: 'Planning' | 'Active' | 'Completed';
  invoicingNotes: string; // Informative info
}

export interface AppSettings {
  weightImportance: number; // weight for importance score
  weightAge: number;        // weight for invoice age
  weightAmount: number;     // weight for amount
}

export interface AnalyticsGoals {
  monthlyRevenue: number;
  clientRetention: number;
  projectCount: number;
}
