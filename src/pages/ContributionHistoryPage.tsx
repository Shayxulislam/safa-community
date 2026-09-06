import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Search, Filter, Lock, CheckCircle2, Heart, ArrowRight } from 'lucide-react';
import { storage } from '../services/storage';
import { SectionHeader } from '../components/ui/SectionHeader';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

export const ContributionHistoryPage: React.FC = () => {
  const contributions = storage.getContributions();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState('all');

  const filtered = contributions.filter(c => {
    const matchCur = selectedCurrency === 'all' || c.currency === selectedCurrency;
    const matchSearch =
      c.contributionNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.purpose.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.isAnonymous ? 'anonymous' : c.donorName.toLowerCase()).includes(searchTerm.toLowerCase());
    return matchCur && matchSearch;
  });

  const totalUZS = contributions
    .filter(c => c.currency === 'UZS' && c.status === 'completed')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalUSD = contributions
    .filter(c => c.currency === 'USD' && c.status === 'completed')
    .reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="py-12 sm:py-16 bg-[#F8FAFC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-left">
        <SectionHeader
          badge="Public Transparency Ledger"
          badgeIcon={<ShieldCheck className="w-3.5 h-3.5" />}
          title="Verified Contribution History"
          description="Every community donation receives an immutable server reference code. This public ledger guarantees zero hidden administrative diversions."
        />

        {/* Aggregated totals banner */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <Card className="p-5 bg-white border border-[#E2E8F0]">
            <span className="text-xs text-[#64748B] block mb-1">Total Verified (UZS)</span>
            <span className="text-2xl font-extrabold text-[#0D47A1]">
              {totalUZS.toLocaleString()} UZS
            </span>
          </Card>
          <Card className="p-5 bg-white border border-[#E2E8F0]">
            <span className="text-xs text-[#64748B] block mb-1">Total Verified (USD)</span>
            <span className="text-2xl font-extrabold text-[#0D47A1]">
              ${totalUSD.toLocaleString()} USD
            </span>
          </Card>
          <Card className="p-5 bg-white border border-[#E2E8F0] flex items-center justify-between">
            <div>
              <span className="text-xs text-[#64748B] block mb-1">Total Contributions</span>
              <span className="text-2xl font-extrabold text-[#172033]">{contributions.length}</span>
            </div>
            <Link to="/support">
              <Button variant="primary" size="sm">Contribute</Button>
            </Link>
          </Card>
        </div>

        {/* Privacy Notice Card */}
        <div className="p-4 rounded-xl bg-[#EAF4FF] border border-[#cbe4ff] mb-8 flex items-start gap-3 text-xs text-[#0D47A1] leading-relaxed">
          <Lock className="w-5 h-5 text-[#1565C0] shrink-0 mt-0.5" />
          <div>
            <strong>Strict Supporter Privacy Mandate:</strong> In compliance with security and privacy best practices, SAFA never publishes private phone numbers, physical addresses, bank cards, or account credentials. Anonymous supporters are protected and designated as "Anonymous Supporter".
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search reference (e.g. SAFA-2026-000001)..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] text-[#172033] focus:border-[#1565C0] outline-hidden"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs text-[#64748B] font-medium">Currency:</span>
            {['all', 'UZS', 'USD'].map(c => (
              <button
                key={c}
                onClick={() => setSelectedCurrency(c)}
                className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${
                  selectedCurrency === c
                    ? 'bg-[#1565C0] text-white'
                    : 'bg-[#F1F5F9] text-[#64748B] hover:text-[#172033]'
                }`}
              >
                {c.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Ledger Table */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden shadow-xs mb-8">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#EAF4FF] text-[#0D47A1] font-bold border-b border-[#E2E8F0]">
                <tr>
                  <th className="py-3 px-4">Server Reference</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Supporter</th>
                  <th className="py-3 px-4">Purpose / Program</th>
                  <th className="py-3 px-4">Method</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {filtered.map(item => (
                  <tr key={item.id} className="hover:bg-[#F8FAFC] transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-[#0D47A1]">
                      {item.contributionNumber}
                    </td>
                    <td className="py-3 px-4 text-[#64748B]">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 font-medium text-[#172033]">
                      {item.isAnonymous ? (
                        <span className="text-[#64748B] italic">Anonymous Supporter</span>
                      ) : (
                        item.donorName
                      )}
                    </td>
                    <td className="py-3 px-4 text-[#64748B] max-w-[200px] truncate">
                      {item.purpose}
                    </td>
                    <td className="py-3 px-4 text-[#64748B] capitalize">
                      {item.paymentMethod.replace('_', ' ')}
                    </td>
                    <td className="py-3 px-4 font-bold text-right text-[#172033]">
                      {item.amount.toLocaleString()} {item.currency}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#DCFCE7] text-[#166534]">
                        <CheckCircle2 className="w-3 h-3" />
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
