import React, { useState } from 'react';
import { Landmark, CheckCircle2, Search, CreditCard, ShieldCheck, Download } from 'lucide-react';
import { Contribution, DonationBankConfig, User } from '../../types';
import { storage } from '../../services/storage';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

interface AdminFinanceTabProps {
  currentUser: User;
  onRefresh: () => void;
}

export const AdminFinanceTab: React.FC<AdminFinanceTabProps> = ({
  currentUser,
  onRefresh
}) => {
  const contributions = storage.getContributions();
  const bankConfig = storage.getBankConfig();

  const [bankForm, setBankForm] = useState<DonationBankConfig>(bankConfig);
  const [isEditingBank, setIsEditingBank] = useState(false);
  const [search, setSearch] = useState('');
  const [notice, setNotice] = useState<string | null>(null);

  const showNotice = (msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice(null), 3000);
  };

  const handleSaveBank = (e: React.FormEvent) => {
    e.preventDefault();
    storage.updateBankConfig(bankForm, currentUser.name);
    setIsEditingBank(false);
    onRefresh();
    showNotice('Bank transfer details updated!');
  };

  const handleReconcile = (id: string) => {
    storage.updateContributionStatus(id, 'completed', currentUser.name);
    onRefresh();
    showNotice('Contribution reconciled and verified.');
  };

  const filtered = contributions.filter(c => {
    if (!search) return true;
    return (
      c.contributionNumber.toLowerCase().includes(search.toLowerCase()) ||
      c.donorName.toLowerCase().includes(search.toLowerCase()) ||
      c.purpose.toLowerCase().includes(search.toLowerCase())
    );
  });

  const totalUZS = contributions
    .filter(c => c.status === 'completed' && c.currency === 'UZS')
    .reduce((a, b) => a + b.amount, 0);

  return (
    <div className="space-y-8 text-left">
      {notice && (
        <div className="p-3.5 rounded-2xl bg-[#5E6E52]/10 border border-[#5E6E52]/20 text-[#5E6E52] text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white border border-[#E5E0D5] shadow-2xs">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#5E6E52]/10 text-[#5E6E52] text-xs font-semibold uppercase tracking-wider mb-2">
            <Landmark className="w-4 h-4" />
            <span>Financial Integrity & Transparency Ledger</span>
          </div>
          <h2 className="text-2xl font-serif font-bold text-[#3D3B36]">
            Contributions & Bank Ledger
          </h2>
          <p className="text-xs text-[#6D6A61] mt-1 max-w-xl leading-relaxed">
            Track individual contribution references, reconcile bank transfers, and update public donation routing accounts.
          </p>
        </div>

        <div className="text-right p-4 rounded-2xl bg-[#F1EDE4] border border-[#E5E0D5]">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#6D6A61]">Reconciled Total</span>
          <div className="text-xl font-serif font-bold text-[#5E6E52]">
            {totalUZS.toLocaleString()} UZS
          </div>
        </div>
      </div>

      {/* Bank Account Config Card */}
      <Card className="p-6 bg-white border border-[#E5E0D5] rounded-3xl shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-serif font-bold text-base text-[#3D3B36]">
              Official Bank Routing Configuration
            </h3>
            <p className="text-xs text-[#6D6A61]">
              Displayed to donors selecting direct banking or transfer methods
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsEditingBank(!isEditingBank)}
          >
            {isEditingBank ? 'Cancel' : 'Edit Details'}
          </Button>
        </div>

        {isEditingBank ? (
          <form onSubmit={handleSaveBank} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
            <div>
              <label className="block text-xs font-bold uppercase text-[#3D3B36] mb-1">Bank Name</label>
              <input
                type="text"
                value={bankForm.bankName}
                onChange={e => setBankForm({ ...bankForm, bankName: e.target.value })}
                className="w-full px-3 py-2 border rounded-xl border-[#E5E0D5] bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-[#3D3B36] mb-1">Account Number (IBAN)</label>
              <input
                type="text"
                value={bankForm.accountNumber}
                onChange={e => setBankForm({ ...bankForm, accountNumber: e.target.value })}
                className="w-full px-3 py-2 border rounded-xl border-[#E5E0D5] bg-white font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-[#3D3B36] mb-1">MFO Code</label>
              <input
                type="text"
                value={bankForm.mfo}
                onChange={e => setBankForm({ ...bankForm, mfo: e.target.value })}
                className="w-full px-3 py-2 border rounded-xl border-[#E5E0D5] bg-white font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-[#3D3B36] mb-1">Account Holder / Organization Name</label>
              <input
                type="text"
                value={bankForm.accountName}
                onChange={e => setBankForm({ ...bankForm, accountName: e.target.value })}
                className="w-full px-3 py-2 border rounded-xl border-[#E5E0D5] bg-white"
              />
            </div>
            <div className="sm:col-span-2 flex justify-end">
              <Button type="submit" variant="primary" size="sm">
                Save Bank Details
              </Button>
            </div>
          </form>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-[#F1EDE4]/50 border border-[#E5E0D5] text-xs">
            <div>
              <span className="text-[#6D6A61] text-[10px] uppercase font-bold">Bank:</span>
              <p className="font-bold text-[#3D3B36]">{bankConfig.bankName}</p>
            </div>
            <div>
              <span className="text-[#6D6A61] text-[10px] uppercase font-bold">Account:</span>
              <p className="font-mono text-[#3D3B36]">{bankConfig.accountNumber}</p>
            </div>
            <div>
              <span className="text-[#6D6A61] text-[10px] uppercase font-bold">MFO:</span>
              <p className="font-mono text-[#3D3B36]">{bankConfig.mfo}</p>
            </div>
            <div>
              <span className="text-[#6D6A61] text-[10px] uppercase font-bold">Account Name:</span>
              <p className="font-bold text-[#3D3B36]">{bankConfig.accountName}</p>
            </div>
          </div>
        )}
      </Card>

      {/* Contributions Table */}
      <Card className="p-6 bg-white border border-[#E5E0D5] rounded-3xl shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h3 className="font-serif font-bold text-base text-[#3D3B36]">
            Recorded Contributions ({contributions.length})
          </h3>
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-[#6D6A61] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search reference or donor..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-full border border-[#E5E0D5] bg-white outline-hidden focus:border-[#5E6E52]"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-[#E5E0D5] text-[#6D6A61] uppercase tracking-wider font-bold text-[10px]">
                <th className="py-3 px-3">Reference #</th>
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-3">Donor</th>
                <th className="py-3 px-3">Amount</th>
                <th className="py-3 px-3">Purpose</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E0D5]">
              {filtered.map(c => (
                <tr key={c.id} className="hover:bg-[#FDFCF9]">
                  <td className="py-3 px-3 font-mono font-bold text-[#5E6E52]">{c.contributionNumber}</td>
                  <td className="py-3 px-3 text-[#6D6A61]">{new Date(c.createdAt).toLocaleDateString()}</td>
                  <td className="py-3 px-3 font-medium text-[#3D3B36]">{c.donorName}</td>
                  <td className="py-3 px-3 font-bold text-[#3D3B36]">{c.amount.toLocaleString()} {c.currency}</td>
                  <td className="py-3 px-3 text-[#6D6A61] max-w-xs truncate">{c.purpose}</td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      c.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    {c.status !== 'completed' && (
                      <Button size="sm" variant="outline" onClick={() => handleReconcile(c.id)}>
                        Verify
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
