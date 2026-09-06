import React, { useState } from 'react';
import {
  Landmark,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  X,
  CreditCard,
  QrCode,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { DonationCampaign, DonationBankConfig, User } from '../../types';
import { storage } from '../../services/storage';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

interface AdminDonationsTabProps {
  currentUser: User;
  onRefresh: () => void;
}

export const AdminDonationsTab: React.FC<AdminDonationsTabProps> = ({
  currentUser,
  onRefresh
}) => {
  const [campaigns, setCampaigns] = useState<DonationCampaign[]>(storage.getDonationCampaigns());
  const [bankConfig, setBankConfig] = useState<DonationBankConfig>(storage.getBankConfig());
  const [editingCampaign, setEditingCampaign] = useState<DonationCampaign | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const [campForm, setCampForm] = useState<DonationCampaign>({
    id: '',
    title: '',
    description: '',
    targetAmount: 0,
    raisedAmount: 0,
    currency: 'UZS',
    coverImage: '',
    status: 'active',
    bankInstructions: '',
    createdAt: new Date().toISOString()
  });

  const showNotice = (msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice(null), 3500);
  };

  const refreshList = () => {
    setCampaigns(storage.getDonationCampaigns());
    setBankConfig(storage.getBankConfig());
    onRefresh();
  };

  const handleStartCreate = () => {
    setEditingCampaign(null);
    setCampForm({
      id: `camp-${Date.now()}`,
      title: '',
      description: '',
      targetAmount: 0,
      raisedAmount: 0,
      currency: 'UZS',
      coverImage: '',
      status: 'active',
      bankInstructions: 'Specify campaign name in payment note.',
      createdAt: new Date().toISOString()
    });
    setIsCreating(true);
  };

  const handleStartEdit = (camp: DonationCampaign) => {
    setIsCreating(false);
    setEditingCampaign(camp);
    setCampForm({ ...camp });
  };

  const handleSaveCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    storage.saveDonationCampaign(campForm, currentUser.name);
    showNotice(`Campaign "${campForm.title}" saved.`);
    setIsCreating(false);
    setEditingCampaign(null);
    refreshList();
  };

  const handleDeleteCampaign = (camp: DonationCampaign) => {
    if (window.confirm(`Delete campaign "${camp.title}"?`)) {
      storage.deleteDonationCampaign(camp.id, currentUser.name);
      showNotice(`Campaign "${camp.title}" deleted.`);
      refreshList();
    }
  };

  const handleSaveBankConfig = (e: React.FormEvent) => {
    e.preventDefault();
    storage.saveBankConfig(bankConfig, currentUser.name);
    showNotice('Bank transfer details updated successfully.');
    onRefresh();
  };

  return (
    <div className="space-y-8 text-left">
      {notice && (
        <div className="p-4 rounded-2xl bg-[#5E6E52]/10 border border-[#5E6E52]/20 text-[#5E6E52] text-xs font-semibold flex items-center gap-2.5 animate-fadeIn shadow-2xs">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-white border border-[#E5E0D5] shadow-2xs">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#5E6E52]/10 text-[#5E6E52] text-xs font-semibold uppercase tracking-wider mb-2">
            <Landmark className="w-3.5 h-3.5" />
            <span>Contributions & Campaigns</span>
          </div>
          <h2 className="text-2xl font-serif font-bold text-[#3D3B36]">
            Donation Campaigns & Bank Setup
          </h2>
          <p className="text-xs text-[#6D6A61] mt-1 max-w-xl leading-relaxed">
            Manage fundraising campaign goals, bank transfer instructions, and public contribution methods displayed on the Support page.
          </p>
        </div>

        <Button
          onClick={handleStartCreate}
          variant="primary"
          size="md"
          className="shrink-0 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Campaign</span>
        </Button>
      </div>

      {/* Campaign Form Modal */}
      {(isCreating || editingCampaign) && (
        <Card className="p-6 sm:p-8 bg-[#FDFCF9] border-2 border-[#5E6E52] rounded-3xl shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-[#E5E0D5] pb-4">
            <div>
              <h3 className="font-serif font-bold text-lg text-[#3D3B36]">
                {editingCampaign ? `Edit Campaign: ${editingCampaign.title}` : 'Add New Fundraising Campaign'}
              </h3>
              <p className="text-xs text-[#6D6A61]">
                Define funding target, description, and status.
              </p>
            </div>
            <button
              onClick={() => {
                setIsCreating(false);
                setEditingCampaign(null);
              }}
              className="p-1.5 rounded-full text-[#6D6A61] hover:bg-[#F1EDE4]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSaveCampaign} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#3D3B36] mb-1">
                  Campaign Title *
                </label>
                <input
                  type="text"
                  required
                  value={campForm.title}
                  onChange={e => setCampForm({ ...campForm, title: e.target.value })}
                  placeholder="e.g. Accessibility Ramps Initiative"
                  className="w-full px-3 py-2 rounded-xl border border-[#E5E0D5] bg-white text-xs font-semibold text-[#3D3B36]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#3D3B36] mb-1">
                  Status
                </label>
                <select
                  value={campForm.status}
                  onChange={e => setCampForm({ ...campForm, status: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-xl border border-[#E5E0D5] bg-white text-xs font-semibold text-[#3D3B36]"
                >
                  <option value="active">Active (Accepting Donations)</option>
                  <option value="completed">Completed (Goal Met)</option>
                  <option value="paused">Paused</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#3D3B36] mb-1">
                  Target Goal (Amount) *
                </label>
                <input
                  type="number"
                  required
                  value={campForm.targetAmount}
                  onChange={e => setCampForm({ ...campForm, targetAmount: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl border border-[#E5E0D5] bg-white text-xs font-mono text-[#3D3B36]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#3D3B36] mb-1">
                  Raised So Far
                </label>
                <input
                  type="number"
                  value={campForm.raisedAmount}
                  onChange={e => setCampForm({ ...campForm, raisedAmount: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl border border-[#E5E0D5] bg-white text-xs font-mono text-[#3D3B36]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#3D3B36] mb-1">
                  Currency
                </label>
                <input
                  type="text"
                  value={campForm.currency}
                  onChange={e => setCampForm({ ...campForm, currency: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#E5E0D5] bg-white text-xs font-bold text-[#3D3B36]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#3D3B36] mb-1">
                Campaign Description *
              </label>
              <textarea
                rows={3}
                required
                value={campForm.description}
                onChange={e => setCampForm({ ...campForm, description: e.target.value })}
                placeholder="What community need does this fund directly solve?"
                className="w-full px-3 py-2 rounded-xl border border-[#E5E0D5] bg-white text-xs leading-relaxed text-[#3D3B36]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#3D3B36] mb-1">
                  Cover Image URL
                </label>
                <input
                  type="text"
                  value={campForm.coverImage}
                  onChange={e => setCampForm({ ...campForm, coverImage: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#E5E0D5] bg-white text-xs font-mono text-[#3D3B36]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#3D3B36] mb-1">
                  Payment Reference Note Instructions
                </label>
                <input
                  type="text"
                  value={campForm.bankInstructions || ''}
                  onChange={e => setCampForm({ ...campForm, bankInstructions: e.target.value })}
                  placeholder="e.g. Specify 'Ramps Fund' in payment note."
                  className="w-full px-3 py-2 rounded-xl border border-[#E5E0D5] bg-white text-xs text-[#3D3B36]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E5E0D5]">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsCreating(false);
                  setEditingCampaign(null);
                }}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm">
                {editingCampaign ? 'Save Campaign Changes' : 'Publish Campaign'}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Campaigns Grid */}
      <div className="space-y-4">
        <h3 className="font-serif font-bold text-lg text-[#3D3B36]">
          Active Community Campaigns
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {campaigns.map(camp => {
            const percent = Math.min(100, Math.round((camp.raisedAmount / camp.targetAmount) * 100));
            return (
              <Card
                key={camp.id}
                className="p-5 bg-white border border-[#E5E0D5] rounded-3xl shadow-2xs flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full ${
                      camp.status === 'active'
                        ? 'bg-emerald-100 text-emerald-800'
                        : camp.status === 'completed'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-stone-100 text-stone-700'
                    }`}>
                      {camp.status}
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleStartEdit(camp)}
                        className="p-1 rounded text-[#6D6A61] hover:bg-[#F1EDE4]"
                        title="Edit"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteCampaign(camp)}
                        className="p-1 rounded text-red-600 hover:bg-red-50"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <h4 className="font-serif font-bold text-base text-[#3D3B36]">
                    {camp.title}
                  </h4>
                  <p className="text-xs text-[#6D6A61] line-clamp-2 leading-relaxed">
                    {camp.description}
                  </p>

                  {/* Progress Bar */}
                  <div className="space-y-1 pt-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-[#5E6E52]">
                        {camp.raisedAmount.toLocaleString()} {camp.currency}
                      </span>
                      <span className="text-[#6D6A61]">
                        {percent}% of {camp.targetAmount.toLocaleString()}
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-[#E5E0D5] overflow-hidden">
                      <div
                        className="h-full bg-[#5E6E52] rounded-full transition-all duration-300"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Bank Account Config Section */}
      <Card className="p-6 sm:p-8 bg-white border border-[#E5E0D5] rounded-3xl shadow-2xs space-y-6">
        <div className="flex items-center gap-2 border-b border-[#E5E0D5] pb-4">
          <Landmark className="w-5 h-5 text-[#5E6E52]" />
          <div>
            <h3 className="font-serif font-bold text-lg text-[#3D3B36]">
              Official Bank Transfer Information
            </h3>
            <p className="text-xs text-[#6D6A61]">
              Account credentials displayed to donors making direct wire transfers or bank deposits.
            </p>
          </div>
        </div>

        <form onSubmit={handleSaveBankConfig} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#3D3B36] mb-1">
                Bank Name
              </label>
              <input
                type="text"
                required
                value={bankConfig.bankName}
                onChange={e => setBankConfig({ ...bankConfig, bankName: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-[#E5E0D5] bg-white text-xs font-medium text-[#3D3B36]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#3D3B36] mb-1">
                Account Holder Name
              </label>
              <input
                type="text"
                required
                value={bankConfig.accountName}
                onChange={e => setBankConfig({ ...bankConfig, accountName: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-[#E5E0D5] bg-white text-xs font-medium text-[#3D3B36]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#3D3B36] mb-1">
                Account Number (IBAN/Checking)
              </label>
              <input
                type="text"
                required
                value={bankConfig.accountNumber}
                onChange={e => setBankConfig({ ...bankConfig, accountNumber: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-[#E5E0D5] bg-white text-xs font-mono font-bold text-[#3D3B36]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#3D3B36] mb-1">
                MFO Code
              </label>
              <input
                type="text"
                required
                value={bankConfig.mfo}
                onChange={e => setBankConfig({ ...bankConfig, mfo: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-[#E5E0D5] bg-white text-xs font-mono text-[#3D3B36]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#3D3B36] mb-1">
                INN (Tax ID)
              </label>
              <input
                type="text"
                required
                value={bankConfig.inn}
                onChange={e => setBankConfig({ ...bankConfig, inn: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-[#E5E0D5] bg-white text-xs font-mono text-[#3D3B36]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#3D3B36] mb-1">
              Instructions / Wire Note
            </label>
            <textarea
              rows={2}
              value={bankConfig.note}
              onChange={e => setBankConfig({ ...bankConfig, note: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-[#E5E0D5] bg-white text-xs text-[#3D3B36]"
            />
          </div>

          <div className="flex justify-end pt-2">
            <Button type="submit" variant="primary" size="md">
              Update Bank Transfer Setup
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
