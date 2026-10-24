import { useState } from 'react';
import { BankProvider, useBank } from '@/context/BankContext';
import { LoginPage } from '@/pages/LoginPage';
import { DashboardShell, type ViewKey } from '@/components/DashboardShell';
import { OverviewView } from '@/pages/OverviewView';
import { TransferView } from '@/pages/TransferView';
import { TransactionsView } from '@/pages/TransactionsView';
import { SecurityView } from '@/pages/SecurityView';
import { ProfileView } from '@/pages/ProfileView';
import type { Account } from '@/lib/types';

function AuthedApp() {
  const { state } = useBank();
  const [view, setView] = useState<ViewKey>('overview');
  const [quickFrom, setQuickFrom] = useState<Account | null>(null);

  const activeAlerts = state.alerts.filter((a) => !a.dismissed).length;

  const navigate = (v: ViewKey) => {
    setView(v);
    if (v !== 'transfer') setQuickFrom(null);
  };

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
    <DashboardShell active={view} onNavigate={navigate} alertBadge={activeAlerts}>
      {content}
    </DashboardShell>
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
