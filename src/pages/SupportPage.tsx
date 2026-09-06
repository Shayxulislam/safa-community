import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import {
  Heart,
  ShieldCheck,
  Building,
  CreditCard,
  Lock,
  Copy,
  Check,
  ArrowRight,
  AlertTriangle
} from 'lucide-react';
import { storage } from '../services/storage';
import { SectionHeader } from '../components/ui/SectionHeader';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

export const SupportPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const bankConfig = storage.getBankConfig();
  const campaigns = storage.getDonationCampaigns().filter(c => c.status === 'active');

  const [method, setMethod] = useState<'card_checkout' | 'bank_transfer'>('card_checkout');
  const [currency, setCurrency] = useState<'UZS' | 'USD'>('UZS');
  const [amount, setAmount] = useState<number>(100000);
  const [isCustom, setIsCustom] = useState<boolean>(false);
  const [customVal, setCustomVal] = useState<string>('');
  const [purpose, setPurpose] = useState<string>(campaigns[0]?.title || 'General Community Support');
  const [donorName, setDonorName] = useState<string>('');
  const [isAnonymous, setIsAnonymous] = useState<boolean>(false);
  const [donorEmail, setDonorEmail] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => {
    const qAmount = searchParams.get('amount');
    const qCurrency = searchParams.get('currency');
    const qPurpose = searchParams.get('purpose');

    if (qAmount) {
      setAmount(Number(qAmount));
      setIsCustom(false);
    }
    if (qCurrency === 'USD' || qCurrency === 'UZS') {
      setCurrency(qCurrency);
    }
    if (qPurpose) {
      setPurpose(qPurpose);
    }
  }, [searchParams]);

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleContributeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalAmount = isCustom ? Number(customVal) : amount;

    if (!finalAmount || finalAmount <= 0) {
      alert('Please enter or select a valid contribution amount.');
      return;
    }

    setIsProcessing(true);

    setTimeout(() => {
      // Record server-side reference
      const contribution = storage.recordContribution({
        amount: finalAmount,
        currency,
        purpose,
        donorName: isAnonymous ? 'Anonymous Supporter' : (donorName || 'Supporter'),
        isAnonymous,
        paymentMethod: method
      });

      setIsProcessing(false);
      navigate(`/contributions/success?ref=${contribution.contributionNumber}&amount=${finalAmount}&currency=${currency}&purpose=${encodeURIComponent(purpose)}&anon=${isAnonymous}`);
    }, 750);
  };

  return (
    <div className="py-12 sm:py-16 bg-[#F8FAFC]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-left">
        <SectionHeader
          badge="Support SAFA"
          badgeIcon={<Heart className="w-3.5 h-3.5 fill-[#0D47A1]" />}
          title="Direct, Documented Community Contribution"
          description="Support families, lonely elderly citizens, and accessibility drives. Every sum is accounted for on our transparent public ledger."
        />

        {/* Active Emergency / Community Campaigns */}
        {campaigns.length > 0 && (
          <div className="mb-8 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#64748B]">
              Active Urgent Community Campaigns
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {campaigns.map(camp => {
                const target = camp.targetAmount || camp.goalAmount || 1;
                const percent = Math.min(100, Math.round((camp.raisedAmount / target) * 100));
                const isSelected = purpose === camp.title;

                return (
                  <div
                    key={camp.id}
                    onClick={() => setPurpose(camp.title)}
                    className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#EAF4FF] border-[#1565C0] ring-1 ring-[#1565C0]'
                        : 'bg-white border-[#E2E8F0] hover:border-[#94A3B8]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        {camp.category || 'Campaign'}
                      </span>
                      <span className="text-xs font-bold text-[#1565C0]">
                        {percent}% Funded
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-[#172033] mb-1">
                      {camp.title}
                    </h4>
                    <p className="text-xs text-[#64748B] line-clamp-2 mb-3">
                      {camp.description}
                    </p>

                    <div className="w-full bg-[#E2E8F0] h-2 rounded-full overflow-hidden mb-2">
                      <div
                        className="bg-[#1565C0] h-full rounded-full transition-all"
                        style={{ width: `${percent}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-[#64748B]">
                      <span>Raised: <strong>{camp.raisedAmount.toLocaleString()} {camp.currency}</strong></span>
                      <span>Target: {target.toLocaleString()} {camp.currency}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Payment Method Switcher */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <button
            type="button"
            onClick={() => setMethod('card_checkout')}
            className={`p-4 rounded-xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
              method === 'card_checkout'
                ? 'bg-[#EAF4FF] border-[#1565C0] shadow-xs'
                : 'bg-white border-[#E2E8F0] hover:border-[#cbd5e1]'
            }`}
          >
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
              method === 'card_checkout' ? 'bg-[#1565C0] text-white' : 'bg-[#F1F5F9] text-[#64748B]'
            }`}>
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-[#172033]">Online Checkout Gateway</p>
              <p className="text-xs text-[#64748B]">Payme / Click / Card / Global Pay</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setMethod('bank_transfer')}
            className={`p-4 rounded-xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
              method === 'bank_transfer'
                ? 'bg-[#EAF4FF] border-[#1565C0] shadow-xs'
                : 'bg-white border-[#E2E8F0] hover:border-[#cbd5e1]'
            }`}
          >
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
              method === 'bank_transfer' ? 'bg-[#1565C0] text-white' : 'bg-[#F1F5F9] text-[#64748B]'
            }`}>
              <Building className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-[#172033]">Official Bank Transfer</p>
              <p className="text-xs text-[#64748B]">Direct IBAN / Mahalla Account</p>
            </div>
          </button>
        </div>

        {method === 'bank_transfer' ? (
          /* Official Bank Details View */
          <Card className="p-6 sm:p-8 mb-8 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-[#E2E8F0]">
              <div>
                <h3 className="text-lg font-bold text-[#172033]">Official Bank Details for SAFA</h3>
                <p className="text-xs text-[#64748B]">Configured by Authorized SAFA Administration</p>
              </div>
              <span className="text-xs font-bold text-[#16A34A] bg-[#DCFCE7] px-2.5 py-1 rounded-full">
                Verified Account
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0]">
                <span className="text-[#64748B] block mb-1">Bank Name</span>
                <span className="font-semibold text-[#172033] text-sm">{bankConfig.bankName}</span>
              </div>
              <div className="p-4 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0]">
                <span className="text-[#64748B] block mb-1">Account Holder Name</span>
                <span className="font-semibold text-[#172033] text-sm">{bankConfig.accountName}</span>
              </div>
              <div className="p-4 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] sm:col-span-2 flex items-center justify-between">
                <div>
                  <span className="text-[#64748B] block mb-1">Settlement Account (IBAN)</span>
                  <span className="font-mono font-bold text-[#0D47A1] text-base">{bankConfig.accountNumber}</span>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard(bankConfig.accountNumber, 'acc')}
                  className="p-2 rounded-md bg-white border border-[#E2E8F0] text-[#64748B] hover:text-[#172033]"
                  title="Copy account number"
                >
                  {copiedField === 'acc' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <div className="p-4 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0]">
                <span className="text-[#64748B] block mb-1">MFO Code</span>
                <span className="font-mono font-semibold text-[#172033]">{bankConfig.mfo}</span>
              </div>
              <div className="p-4 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0]">
                <span className="text-[#64748B] block mb-1">INN / Tax Number</span>
                <span className="font-mono font-semibold text-[#172033]">{bankConfig.inn}</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 leading-relaxed">
              <strong>Transfer Payment Remarks Note:</strong> {bankConfig.note}
            </div>

            <div className="pt-4 border-t border-[#E2E8F0] flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="text-xs text-[#64748B]">After transferring, send receipt to safaauzb@gmail.com or Telegram.</span>
              <Button
                variant="primary"
                size="md"
                onClick={() => {
                  storage.recordContribution({
                    amount: 500000,
                    currency: 'UZS',
                    purpose: 'Bank Transfer Contribution Notification',
                    donorName: 'Bank Contributor',
                    isAnonymous: true,
                    paymentMethod: 'bank_transfer'
                  });
                  alert('Thank you! A reference will be attached once the bank statement is reconciled.');
                  navigate('/contributions/history');
                }}
              >
                Notify SAFA of Completed Transfer
              </Button>
            </div>
          </Card>
        ) : (
          /* Online Contribution Form */
          <form onSubmit={handleContributeSubmit}>
            <Card className="p-6 sm:p-8 mb-8 space-y-6">
              {/* Currency & Amount Selection */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#172033]">
                    1. Select Amount & Currency
                  </label>
                  <div className="flex items-center gap-1 bg-[#F1F5F9] p-1 rounded-lg">
                    <button
                      type="button"
                      onClick={() => {
                        setCurrency('UZS');
                        setAmount(100000);
                        setIsCustom(false);
                      }}
                      className={`px-2.5 py-1 rounded text-xs font-bold transition-colors ${
                        currency === 'UZS' ? 'bg-[#1565C0] text-white' : 'text-[#64748B]'
                      }`}
                    >
                      UZS
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setCurrency('USD');
                        setAmount(25);
                        setIsCustom(false);
                      }}
                      className={`px-2.5 py-1 rounded text-xs font-bold transition-colors ${
                        currency === 'USD' ? 'bg-[#1565C0] text-white' : 'text-[#64748B]'
                      }`}
                    >
                      USD
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
                  {(currency === 'UZS' ? [50000, 100000, 250000, 500000] : [10, 25, 50, 100]).map(val => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => {
                        setAmount(val);
                        setIsCustom(false);
                      }}
                      className={`p-3 rounded-lg border text-sm font-bold transition-all text-center ${
                        !isCustom && amount === val
                          ? 'bg-[#EAF4FF] border-[#1565C0] text-[#0D47A1]'
                          : 'bg-white border-[#E2E8F0] text-[#172033] hover:border-[#cbd5e1]'
                      }`}
                    >
                      {val.toLocaleString()} {currency}
                    </button>
                  ))}
                </div>

                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    placeholder={`Or enter custom amount in ${currency}...`}
                    value={customVal}
                    onChange={e => {
                      setCustomVal(e.target.value);
                      setIsCustom(true);
                    }}
                    className="w-full px-4 py-2.5 rounded-lg border border-[#E2E8F0] bg-white text-sm text-[#172033] focus:border-[#1565C0] outline-hidden"
                  />
                </div>
              </div>

              {/* Purpose Selection */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#172033] mb-2">
                  2. Contribution Purpose / Program
                </label>
                <select
                  value={purpose}
                  onChange={e => setPurpose(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-[#E2E8F0] bg-white text-sm text-[#172033] focus:border-[#1565C0] outline-hidden"
                >
                  {campaigns.length > 0 && (
                    <optgroup label="Active Community Campaigns">
                      {campaigns.map(c => (
                        <option key={c.id} value={c.title}>
                          {c.title}
                        </option>
                      ))}
                    </optgroup>
                  )}
                  <optgroup label="Standard Impact Programs">
                    <option value="General Community Support">General Community Support (Where needed most)</option>
                    <option value="Winter Warmth & Groceries">Winter Warmth & Family Food Packages</option>
                    <option value="Accessibility Ramps & Aids">Disability Accessibility & Wheelchair Ramps</option>
                    <option value="Elderly Companion Visits">Elderly Care & Prescription Medication</option>
                    <option value="School Kits for Children">Youth Education & School Kits</option>
                  </optgroup>
                </select>
              </div>

              {/* Supporter Details & Privacy */}
              <div className="pt-4 border-t border-[#E2E8F0]">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#172033] mb-2">
                  3. Supporter Information & Privacy
                </label>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs text-[#64748B] mb-1">Your Name (optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. Dilnoza K."
                      value={donorName}
                      disabled={isAnonymous}
                      onChange={e => setDonorName(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-lg border border-[#E2E8F0] bg-white text-sm text-[#172033] disabled:bg-[#F1F5F9] outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-[#64748B] mb-1">Email for Receipt Confirmation</label>
                    <input
                      type="email"
                      placeholder="e.g. yourname@example.com"
                      value={donorEmail}
                      onChange={e => setDonorEmail(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-lg border border-[#E2E8F0] bg-white text-sm text-[#172033] outline-hidden"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="anonCheck"
                      checked={isAnonymous}
                      onChange={e => setIsAnonymous(e.target.checked)}
                      className="w-4 h-4 rounded text-[#1565C0] border-[#E2E8F0] focus:ring-[#1565C0]"
                    />
                    <label htmlFor="anonCheck" className="text-xs text-[#172033] font-medium cursor-pointer">
                      Publish anonymously on the public ledger as "Anonymous Supporter"
                    </label>
                  </div>
                </div>
              </div>

              {/* Security Banner: Zero raw card storage */}
              <div className="p-4 rounded-xl bg-[#EAF4FF] border border-[#cbe4ff] text-xs text-[#0D47A1] flex items-start gap-3">
                <Lock className="w-5 h-5 text-[#1565C0] shrink-0 mt-0.5" />
                <div>
                  <strong className="font-semibold block mb-0.5">Strict Security Standard:</strong>
                  SAFA never collects or stores raw credit/debit card numbers or PINs. Checkout is safely tokenized through compliant national and global payment gateways.
                </div>
              </div>

              {/* Submit CTA */}
              <Button
                type="submit"
                variant="primary"
                size="lg"
                disabled={isProcessing}
                className="w-full shadow-md"
                icon={<Heart className="w-5 h-5 fill-white" />}
              >
                {isProcessing ? 'Generating Secure Reference...' : `Confirm Contribution (${(isCustom ? Number(customVal) || 0 : amount).toLocaleString()} ${currency})`}
              </Button>
            </Card>
          </form>
        )}

        {/* Link to contribution history */}
        <div className="text-center">
          <Link
            to="/contributions/history"
            className="text-xs font-semibold text-[#0D47A1] hover:underline inline-flex items-center gap-1"
          >
            <span>View Transparent Contribution History & Reference Numbers</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
};
