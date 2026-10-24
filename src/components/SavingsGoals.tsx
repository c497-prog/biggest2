import { useState } from 'react';
import { Target, Plus, PiggyBank, CheckCircle, Calendar, ArrowRight, Trash2 } from 'lucide-react';
import { useBank } from '@/context/BankContext';
import { fmtMoney, fmtDate } from '@/lib/format';
import { Modal } from '@/components/Modal';
import type { SavingsGoal } from '@/lib/types';

export function SavingsGoals() {
  const { state, contributeToGoal, addSavingsGoal, deleteSavingsGoal } = useBank();
  const [selectedGoal, setSelectedGoal] = useState<SavingsGoal | null>(null);
  const [depositAmount, setDepositAmount] = useState<string>('250');
  const [fromAccount, setFromAccount] = useState<string>('acc-checking');
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // New goal form state
  const [newName, setNewName] = useState('');
  const [newTarget, setNewTarget] = useState('');
  const [newCategory, setNewCategory] = useState('Personal');
  const [newDate, setNewDate] = useState('2027-01-01');

  const openDeposit = (goal: SavingsGoal) => {
    setSelectedGoal(goal);
    setDepositAmount('250');
    setIsDepositOpen(true);
  };

  const handleDeposit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGoal) return;
    const amount = parseFloat(depositAmount);
    if (!amount || amount <= 0) return;

    const res = contributeToGoal(selectedGoal.id, amount, fromAccount);
    if (res.ok) {
      setIsDepositOpen(false);
    }
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const target = parseFloat(newTarget);
    if (!newName.trim() || !target || target <= 0) return;

    addSavingsGoal({
      name: newName.trim(),
      targetAmount: target,
      category: newCategory,
      targetDate: newDate,
      color: 'from-brand-500 to-indigo-700',
    });

    setNewName('');
    setNewTarget('');
    setIsCreateOpen(false);
  };

  return (
    <div className="card p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-5">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 ring-1 ring-emerald-200/50 dark:ring-emerald-800/50">
            <Target className="h-5 w-5" />
          </span>
          <div>
            <h2 className="font-display text-lg font-bold text-ink-900 dark:text-ink-100">
              Savings & Financial Goals
            </h2>
            <p className="text-xs text-ink-500 dark:text-ink-400">
              Track progress and set aside money with automated vaults
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="btn-outline text-xs py-2 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="h-4 w-4" /> New Goal
        </button>
      </div>

      {state.savingsGoals.length === 0 ? (
        <div className="rounded-xl border border-dashed border-ink-200 p-8 text-center dark:border-ink-800">
          <PiggyBank className="mx-auto h-8 w-8 text-ink-400" />
          <p className="mt-2 text-sm font-semibold text-ink-700 dark:text-ink-300">
            No savings goals yet
          </p>
          <p className="mt-1 text-xs text-ink-400">
            Create a dedicated goal to start saving for your next milestone.
          </p>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="btn-primary mt-4 text-xs py-2"
          >
            Create your first goal
          </button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {state.savingsGoals.map((goal) => {
            const pct = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
            const isCompleted = goal.currentAmount >= goal.targetAmount;
            const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);

            return (
              <div
                key={goal.id}
                className="group relative flex flex-col justify-between rounded-xl border border-ink-100 bg-ink-50/50 p-4 transition-all hover:border-brand-200 hover:shadow-card dark:border-ink-800/80 dark:bg-ink-900/60 dark:hover:border-brand-800"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="pill text-[10px] bg-brand-50 text-brand-700 dark:bg-brand-950/70 dark:text-brand-300">
                        {goal.category}
                      </span>
                      <h3 className="mt-2 font-display text-base font-bold text-ink-900 dark:text-ink-100">
                        {goal.name}
                      </h3>
                    </div>
                    <button
                      onClick={() => deleteSavingsGoal(goal.id)}
                      className="opacity-0 group-hover:opacity-100 transition p-1 text-ink-400 hover:text-rose-500 rounded-lg"
                      title="Delete goal"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <div className="mt-4 flex items-baseline justify-between text-xs">
                    <span className="font-display text-xl font-extrabold text-ink-900 dark:text-ink-100">
                      {fmtMoney(goal.currentAmount)}
                    </span>
                    <span className="text-ink-500 dark:text-ink-400">
                      target {fmtMoney(goal.targetAmount)}
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-ink-200/70 dark:bg-ink-800">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isCompleted
                          ? 'bg-emerald-500'
                          : 'bg-gradient-to-r from-brand-500 to-indigo-600'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>

                  <div className="mt-2 flex items-center justify-between text-[11px] text-ink-500 dark:text-ink-400">
                    <span className="font-semibold text-ink-700 dark:text-ink-300">
                      {pct}% funded
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {fmtDate(goal.targetDate)}
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-ink-100 dark:border-ink-800/80 flex items-center justify-between">
                  {isCompleted ? (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                      <CheckCircle className="h-3.5 w-3.5" /> Goal reached!
                    </span>
                  ) : (
                    <span className="text-xs text-ink-500 dark:text-ink-400">
                      {fmtMoney(remaining)} remaining
                    </span>
                  )}

                  <button
                    onClick={() => openDeposit(goal)}
                    className="text-xs font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300 flex items-center gap-1 cursor-pointer"
                  >
                    + Add funds <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: Deposit to Goal */}
      <Modal
        open={isDepositOpen}
        onClose={() => setIsDepositOpen(false)}
        title={selectedGoal ? `Add Funds to ${selectedGoal.name}` : 'Add Funds'}
      >
        <form onSubmit={handleDeposit} className="space-y-4">
          <div>
            <label className="label">From Account</label>
            <select
              className="input cursor-pointer"
              value={fromAccount}
              onChange={(e) => setFromAccount(e.target.value)}
            >
              {state.accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} ({fmtMoney(a.balance)})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Amount ($)</label>
            <div className="flex gap-2 mb-2">
              {['50', '100', '250', '500'].map((preset) => (
                <button
                  type="button"
                  key={preset}
                  onClick={() => setDepositAmount(preset)}
                  className={`btn-outline flex-1 py-1.5 text-xs ${
                    depositAmount === preset
                      ? 'border-brand-500 text-brand-600 dark:border-brand-400 dark:text-brand-300 font-bold'
                      : ''
                  }`}
                >
                  ${preset}
                </button>
              ))}
            </div>
            <input
              type="number"
              min="1"
              step="any"
              className="input font-mono text-base font-semibold"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
              placeholder="0.00"
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsDepositOpen(false)}
              className="btn-ghost text-sm"
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary text-sm">
              Confirm Deposit
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Create New Goal */}
      <Modal
        open={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Create New Savings Goal"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="label">Goal Name</label>
            <input
              className="input"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g. Wedding, House Down Payment, Vacation"
              required
            />
          </div>

          <div>
            <label className="label">Target Amount ($)</label>
            <input
              type="number"
              min="10"
              step="any"
              className="input font-mono"
              value={newTarget}
              onChange={(e) => setNewTarget(e.target.value)}
              placeholder="5000"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Category</label>
              <select
                className="input cursor-pointer"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
              >
                <option value="Safety Net">Safety Net</option>
                <option value="Travel">Travel</option>
                <option value="Technology">Technology</option>
                <option value="Vehicle">Vehicle</option>
                <option value="Home">Home</option>
                <option value="Personal">Personal</option>
              </select>
            </div>
            <div>
              <label className="label">Target Date</label>
              <input
                type="date"
                className="input cursor-pointer"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <button
              type="button"
              onClick={() => setIsCreateOpen(false)}
              className="btn-ghost text-sm"
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary text-sm">
              Create Goal
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
