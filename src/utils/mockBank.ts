export interface BankFD {
  id: string;
  amount: number;
  rate: number;
  maturityDate: string;
}

export interface BankLoan {
  id: string;
  type: string;
  amount: number;
  emipending: number;
}

export interface CustomerProfile {
  id: string;
  pin: string;
  name: string;
  type: 'standard' | 'elderly' | 'youth';
  accountType: string;
  accountNumber: string;
  balance: number;
  mobile: string;
  fds: BankFD[];
  loans: BankLoan[];
}

const CUSTOMERS: CustomerProfile[] = [
  {
    id: 'CUST-001',
    pin: '1111',
    name: 'Rajesh Kumar',
    type: 'standard',
    accountType: 'Savings Account',
    accountNumber: 'xxxx-xxxx-4321',
    balance: 85430.50,
    mobile: '+91 98765 43210',
    fds: [
      { id: 'FD-101', amount: 500000, rate: 7.1, maturityDate: '2027-05-12' }
    ],
    loans: [
      { id: 'HL-202', type: 'Home Loan', amount: 2500000, emipending: 154 }
    ]
  },
  {
    id: 'CUST-002',
    pin: '2222',
    name: 'Meena Devi',
    type: 'elderly',
    accountType: 'Senior Citizen Savings',
    accountNumber: 'xxxx-xxxx-8899',
    balance: 412000.00,
    mobile: '+91 99887 76655',
    fds: [
      { id: 'FD-102', amount: 1500000, rate: 7.6, maturityDate: '2026-08-20' },
      { id: 'FD-103', amount: 200000, rate: 7.6, maturityDate: '2025-11-10' }
    ],
    loans: []
  },
  {
    id: 'CUST-003',
    pin: '3333',
    name: 'Arjun Singh',
    type: 'youth',
    accountType: 'Salary Account',
    accountNumber: 'xxxx-xxxx-1004',
    balance: 55000.00,
    mobile: '+91 88776 65544',
    fds: [],
    loans: [
      { id: 'EL-301', type: 'Education Loan', amount: 450000, emipending: 48 }
    ]
  }
];

// Helper to simulate network delay
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export async function verifyPin(pin: string): Promise<CustomerProfile | null> {
  await delay(800);
  const cust = CUSTOMERS.find(c => c.pin === pin);
  return cust || null;
}

export async function getBalance(id: string): Promise<number> {
  await delay(600);
  const cust = CUSTOMERS.find(c => c.id === id);
  if (!cust) throw new Error('Customer not found');
  return cust.balance;
}

export async function getMiniStatement(id: string): Promise<string> {
  await delay(800);
  return `Last 3 transactions:\n1. UPI Zomato - ₹450 (Debit)\n2. IMPS Transfer - ₹15,000 (Debit)\n3. Salary NEFT - ₹75,000 (Credit)`;
}

export async function getFDDetails(id: string): Promise<string> {
  await delay(700);
  const cust = CUSTOMERS.find(c => c.id === id);
  if (!cust || cust.fds.length === 0) return 'No active Fixed Deposits found.';
  const fdCount = cust.fds.length;
  const totalAmount = cust.fds.reduce((sum, fd) => sum + fd.amount, 0);
  return `You have ${fdCount} active ${fdCount === 1 ? 'FD' : 'FDs'} totaling ₹${totalAmount.toLocaleString('en-IN')}. The highest rate is ${Math.max(...cust.fds.map(f => f.rate))}% p.a.`;
}

export async function applyForLoan(id: string, branchQueue: boolean = false): Promise<string> {
  await delay(1200);
  if (branchQueue) {
    return 'Your loan application request has been added to the branch queue. A loan officer will see you shortly.';
  }
  return 'Your pre-approved personal loan request is being processed. Our team will contact you within 24 hours.';
}

export async function raiseComplaint(id: string, issue: string): Promise<string> {
  await delay(1000);
  return `Complaint registered for: "${issue}". Ticket ID: SR-${Math.floor(Math.random() * 90000) + 10000}.`;
}
