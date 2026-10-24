export type AccountType = 'checking' | 'savings' | 'sep_ira';

export type TransactionStatus = 'Completed' | 'Pending' | 'Failed';
export type TransactionKind = 'credit' | 'debit';

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  balance: number;
  number: string; // masked display
  color: string; // tailwind gradient classes
  accent: string; // tailwind text/border accent class
}

export interface Transaction {
  id: string;
  date: string; // ISO yyyy-mm-dd
  description: string;
  merchant: string;
  amount: number; // positive number
  kind: TransactionKind;
  status: TransactionStatus;
  accountId: string;
  category: string;
}

export interface Customer {
  fullName: string;
  preferredName: string;
  email: string;
  phone: string;
  address: string;
  occupation: string;
  memberSince: string;
  avatarInitials: string;
}

export interface Preferences {
  language: 'en' | 'es' | 'fr';
  emailAlerts: boolean;
  pushAlerts: boolean;
  twoStepChallenge: boolean;
  paperlessStatements: boolean;
  theme: 'light' | 'dark' | 'system';
}

export interface SecurityAlert {
  id: string;
  title: string;
  detail: string;
  amount: number;
  merchant: string;
  location: string;
  time: string;
  acknowledged: boolean;
  dismissed: boolean;
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  category: string;
  targetDate: string;
  color: string;
  icon?: string;
}

export interface CardSettings {
  id: string;
  accountId: string;
  cardNumber: string; // full simulated 16 digits
  cardHolder: string;
  expiry: string;
  cvv: string;
  isFrozen: boolean;
  onlinePurchases: boolean;
  internationalTx: boolean;
  dailySpendingLimit: number;
  currentSpending: number;
}

export interface ToastNotification {
  id: string;
  title: string;
  message?: string;
  type: 'success' | 'info' | 'warning' | 'error';
}

export interface BankState {
  customer: Customer;
  accounts: Account[];
  transactions: Transaction[];
  preferences: Preferences;
  alerts: SecurityAlert[];
  savingsGoals: SavingsGoal[];
  cards: CardSettings[];
}
