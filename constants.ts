import type {  VendorInvoice, Client, ClientInvoice, Asset, Project, AppSettings, AnalyticsGoals,} from './types';

// Define the Importance type
type Importance = 'Low' | 'Medium' | 'High' | 'Critical' ;
type InvoiceStatus = 'Approved' | 'Hold' | 'Paid' ;

export const DEFAULT_DATA_URL = '/data.json';
export const LS_PREFIX = 'cowork_v1';
export const LS_KEYS = {
  DATA: `${LS_PREFIX}_data`,
  LOGO: `${LS_PREFIX}_logo`,
};

export const DEFAULT_VENDOR_INVOICES: VendorInvoice[] = [
  // { id: '1', vendorName: 'Landlord Holdings', category: 'Rent', invoiceDate: '2023-10-01', dueDate: '2023-10-05', amount: 8500.0, importance: 'High', status: 'Hold'},
  // { id: '2', vendorName: 'City Power & Light', category: 'Utilities', invoiceDate: '2023-09-28', dueDate: '2023-10-10', amount: 1200.5, importance: 'High', status: 'Hold' },
  // { id: '3', vendorName: 'SecureGuard Inc', category: 'Security', invoiceDate: '2023-10-01', dueDate: '2023-10-15', amount: 2500.0, importance: 'Medium', status: 'Hold' },
];

export const DEFAULT_CLIENTS: Client[] = [
  { id: 'CL-001', name: 'TechFlow Solutions', email: 'billing@techflow.io', officeNumber: '101', contractStart: '2023-01-01', contractEnd: '2024-12-31', status: 'Active' },
  { id: 'CL-002', name: 'Design Studio 9', email: 'hello@ds9.com', officeNumber: '102', contractStart: '2023-03-01', contractEnd: '2024-06-30', status: 'Active' },
];

export const DEFAULT_CLIENT_INVOICES: ClientInvoice[] = [
  { id: 'INV-001', clientId: 'CL-001', clientName: 'TechFlow Solutions', description: 'Oct Rent', amount: 2500, invoiceDate: '2023-10-01', dueDate: '2023-10-06', status: 'Paid', isReceiptIssued: true, source: 'Internal' },
];

export const DEFAULT_ASSETS: Asset[] = [
  { id: 'A-001', name: 'Conference Table', category: 'Furniture', purchaseDate: '2022-02-01', value: 450, location: 'Floor 1' }
];

export const DEFAULT_PROJECTS: Project[] = [
  { id: 'PRJ-001', name: 'Startup Accelerator Batch 1', clientName: 'Ministry of Tech', contractValue: 50000, contactPerson: 'Sarah Connor', startDate: '2023-06-01', endDate: '2023-12-31', status: 'Active', invoicingNotes: 'Invoice quarterly. Contact Sarah for PO.' }
];

export const DEFAULT_COMPANY = {
  name: 'Monarch Cowork',
  builtBy: 'Monarch',
  copyrightYear: new Date().getFullYear(),
};

export const DEFAULT_SETTINGS: AppSettings = {
  weightImportance: 60,
  weightAge: 30,
  weightAmount: 10,
};

export const DEFAULT_GOALS: AnalyticsGoals = {
  monthlyRevenue: 10000,
  clientRetention: 90,
  projectCount: 5,
};

export const DEFAULT_SEED = {
  company: DEFAULT_COMPANY,
  defaults: {
    cashBalance: 15000,
    settings: DEFAULT_SETTINGS,
    analyticsGoals: DEFAULT_GOALS,
  },
  users: [],
  vendorInvoices: DEFAULT_VENDOR_INVOICES,
  clients: DEFAULT_CLIENTS,
  clientInvoices: DEFAULT_CLIENT_INVOICES,
  assets: DEFAULT_ASSETS,
  projects: DEFAULT_PROJECTS,
};

export type SeedData = typeof DEFAULT_SEED;