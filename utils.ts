
import { VendorInvoice, AppSettings, Importance, InvoiceStatus } from './types';

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString();
};

export const getImportanceValue = (importance: Importance): number => {
  switch (importance) {
    case Importance.CRITICAL: return 100;
    case Importance.HIGH: return 75;
    case Importance.MEDIUM: return 50;
    case Importance.LOW: return 25;
    default: return 0;
  }
};

export const calculateDaysDiff = (dateString: string): number => {
  const today = new Date();
  const date = new Date(dateString);
  const diffTime = Math.abs(today.getTime() - date.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
};

export const getFifthBusinessDay = (date: Date): Date => {
  const d = new Date(date.getFullYear(), date.getMonth(), 1);
  let businessDays = 0;
  while (businessDays < 5) {
    const day = d.getDay();
    if (day !== 0 && day !== 6) businessDays++; // Not Sunday(0) or Saturday(6)
    if (businessDays < 5) d.setDate(d.getDate() + 1);
  }
  return d;
};

// Export Data to CSV
export const downloadCSV = (data: any[], filename: string) => {
  if (!data.length) return;
  const headers = Object.keys(data[0]).join(',');
  const rows = data.map(obj => Object.values(obj).map(v => `"${v}"`).join(',')).join('\n');
  const csvContent = `data:text/csv;charset=utf-8,${headers}\n${rows}`;
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// The "Brain" of PayRank (Vendor Logic)
export const processInvoices = (
  invoices: VendorInvoice[],
  settings: AppSettings,
  availableCash: number
): VendorInvoice[] => {
  const maxAmount = Math.max(...invoices.map(i => i.amount), 1);
  const maxAge = 90; 

  // 1. Calculate Scores
  const scoredInvoices = invoices.map(invoice => {
    const age = calculateDaysDiff(invoice.invoiceDate);
    
    const normImportance = getImportanceValue(invoice.importance) / 100;
    const normAge = Math.min(age, maxAge) / maxAge;
    const normAmount = invoice.amount / maxAmount;

    const score = 
      (normImportance * (settings.weightImportance / 100)) + 
      (normAge * (settings.weightAge / 100)) + 
      (normAmount * (settings.weightAmount / 100));

    return { ...invoice, score, ageDays: age };
  });

  const manualApproved = scoredInvoices.filter(i => i.isManualOverride && i.status === InvoiceStatus.APPROVED);
  const manualHold = scoredInvoices.filter(i => i.isManualOverride && i.status === InvoiceStatus.HOLD);
  const others = scoredInvoices.filter(i => !i.isManualOverride);

  const manualTotal = manualApproved.reduce((sum, inv) => sum + inv.amount, 0);
  let remainingCash = availableCash - manualTotal;

  const sortedOthers = others.sort((a, b) => (b.score || 0) - (a.score || 0));

  const processedOthers = sortedOthers.map(invoice => {
    if (remainingCash >= invoice.amount) {
      remainingCash -= invoice.amount;
      return { ...invoice, status: InvoiceStatus.APPROVED };
    } else {
      return { ...invoice, status: InvoiceStatus.HOLD };
    }
  });

  const finalApproved = [...manualApproved, ...processedOthers.filter(i => i.status === InvoiceStatus.APPROVED)];
  const finalHold = [...manualHold, ...processedOthers.filter(i => i.status === InvoiceStatus.HOLD)];

  finalApproved.sort((a, b) => (b.score || 0) - (a.score || 0));
  finalHold.sort((a, b) => (b.score || 0) - (a.score || 0));

  return [...finalApproved, ...finalHold];
};

// Simple ID Generator
export const generateId = (prefix: string) => {
  return `${prefix}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
};
