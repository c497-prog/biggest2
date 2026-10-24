import { useState, useMemo } from 'react';
import { BankProvider, useBank } from '@/context/BankContext';
import { LoginPage } from '@/pages/LoginPage';
import { DashboardShell, type ViewKey } from '@/components/DashboardShell';
import { OverviewView } from '@/pages/OverviewView';
import { TransferView } from '@/pages/TransferView';
import { TransactionsView } from '@/pages/TransactionsView';
import { SecurityView } from '@/pages/SecurityView';
import { ProfileView } from '@/pages/ProfileView';
import { TransactionModal } from '@/components/TransactionModal';
import type { Account, Transaction } from '@/lib/types';

function AuthedApp() {
  const { state } = useBank();
  const [view, setView] = useState<ViewKey>('overview');
  const [quickFrom, setQuickFrom] = useState<Account | null>(null);
  const [paletteSelectedTx, setPaletteSelectedTx] = useState<Transaction | null>(null);

  const activeAlerts = state.alerts.filter((a) => !a.dismissed).length;

  const navigate = (v: ViewKey) => {
    setView(v);
    if (v !== 'transfer') setQuickFrom(null);
  };

  const selectedAccount = useMemo(() => {
    if (!paletteSelectedTx) return undefined;
    return state.accounts.find((a) => a.id === paletteSelectedTx.accountId);
  }, [paletteSelectedTx, state.accounts]);

  let content;
  if (view === 'overview') {
    content = (
      <OverviewView
        onNavigate={navigate}
        onQuickTransfer={(a) => setQuickFrom(a)}
        quickTransferAccount={quickFrom}
        onClearQuickTransfer={() => setQuickFrom(null)}
      />
    );
  } else if (view === 'transfer') {
    content = <TransferView presetFromId={quickFrom?.id ?? null} />;
  } else if (view === 'transactions') {
    content = <TransactionsView />;
  } else if (view === 'security') {
    content = <SecurityView />;
  } else {
    content = <ProfileView />;
  }

  return (
    <>
      <DashboardShell
        active={view}
        onNavigate={navigate}
        alertBadge={activeAlerts}
        onSelectTransaction={(tx) => setPaletteSelectedTx(tx)}
      >
        {content}
      </DashboardShell>

      {/* Global modal when a transaction is opened from Command Palette */}
      <TransactionModal
        tx={paletteSelectedTx}
        account={selectedAccount}
        onClose={() => setPaletteSelectedTx(null)}
      />
    </>
  );
}

function Gate() {
  const { authenticated } = useBank();
  return authenticated ? <AuthedApp /> : <LoginPage />;
}

function App() {
  return (
    <BankProvider>
      <Gate />
    </BankProvider>
  );
}

export default App;
