import { useEffect, useState } from 'react';
import {
  ActiveView,
  SaleTransaction,
  StationPricing,
  UserRole,
} from './types';
import { DEFAULT_PRICING, INITIAL_TRANSACTIONS } from './data/initialData.ts';
import { LoginPage } from './components/LoginPage';
import { DashboardLayout } from './components/DashboardLayout';
import { OverviewView } from './components/OverView';
import { RecordSaleView } from './components/RecordSaleView';
import { ContainerMonitorView } from './components/ContainerMonitorView';
import { WaterBillView } from './components/WaterBillView';
import { SalesReportView } from './components/SalesReportView';

const STORAGE_KEYS = {
  TRANSACTIONS: 'pureflow360_transactions_v2',
  PRICING: 'pureflow360_pricing_v1',
  SESSION: 'pureflow360_session_v1',
};

interface SessionState {
  username: string;
  role: UserRole;
}

export default function App() {
  const [session, setSession] = useState<SessionState | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SESSION);
      return saved ? (JSON.parse(saved) as SessionState) : null;
    } catch {
      return null;
    }
  });

  const [activeView, setActiveView] = useState<ActiveView>('overview');

  const [transactions, setTransactions] = useState<SaleTransaction[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      return saved ? (JSON.parse(saved) as SaleTransaction[]) : INITIAL_TRANSACTIONS;
    } catch {
      return INITIAL_TRANSACTIONS;
    }
  });

  const [pricing, setPricing] = useState<StationPricing>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PRICING);
      return saved ? (JSON.parse(saved) as StationPricing) : DEFAULT_PRICING;
    } catch {
      return DEFAULT_PRICING;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
    } catch {
      // Ignore storage quota errors
    }
  }, [transactions]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PRICING, JSON.stringify(pricing));
    } catch {
      // Ignore storage quota errors
    }
  }, [pricing]);

  useEffect(() => {
    try {
      if (session) {
        localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(session));
      } else {
        localStorage.removeItem(STORAGE_KEYS.SESSION);
      }
    } catch {
      // Ignore storage errors
    }
  }, [session]);

  const handleLogin = (username: string, role: UserRole) => {
    setSession({ username, role });
    setActiveView('overview');
  };

  const handleLogout = () => {
    setSession(null);
  };

  const handleAddTransaction = (
    draft: Omit<SaleTransaction, 'id' | 'receiptNo'>
  ): SaleTransaction => {
    const compactDate = draft.date.replace(/-/g, '').slice(2);
    const sameDayCount =
      transactions.filter((t) => t.date === draft.date).length + 1;
    const receiptNo = `PF-${compactDate}-${String(sameDayCount).padStart(3, '0')}`;

    const newTx: SaleTransaction = {
      ...draft,
      id: `tx-${Date.now()}`,
      receiptNo,
    };

    setTransactions((prev) => [newTx, ...prev]);
    return newTx;
  };

  const handleDeleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  if (!session) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <DashboardLayout
      activeView={activeView}
      onNavigate={setActiveView}
      username={session.username}
      role={session.role}
      onRoleSwitch={(role) => setSession((prev) => (prev ? { ...prev, role } : prev))}
      onLogout={handleLogout}
    >
      {activeView === 'overview' && (
        <OverviewView transactions={transactions} onNavigate={setActiveView} />
      )}
      {activeView === 'record-sale' && (
        <RecordSaleView
          pricing={pricing}
          onUpdatePricing={setPricing}
          onAddTransaction={handleAddTransaction}
          role={session.role}
          username={session.username}
        />
      )}
      {activeView === 'container-monitor' && (
        <ContainerMonitorView transactions={transactions} />
      )}
      {activeView === 'water-bill' && (
        <WaterBillView transactions={transactions} />
      )}
      {activeView === 'sales-reports' && (
        <SalesReportView
          transactions={transactions}
          role={session.role}
          onDeleteTransaction={handleDeleteTransaction}
        />
      )}
    </DashboardLayout>
  );
}
