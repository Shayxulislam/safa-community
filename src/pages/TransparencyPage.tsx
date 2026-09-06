import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, FileText, Download, Lock, CheckCircle2, ArrowRight } from 'lucide-react';
import { storage } from '../services/storage';
import { SectionHeader } from '../components/ui/SectionHeader';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

export const TransparencyPage: React.FC = () => {
  const reports = storage.getReports();

  return (
    <div className="py-12 sm:py-16 bg-[#F8FAFC]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-left">
        <SectionHeader
          badge="Public Accountability"
          badgeIcon={<ShieldCheck className="w-3.5 h-3.5" />}
          title="Transparency, Financials & Reports"
          description="We hold ourselves accountable to our donors, volunteers, and the families we serve. Review our verified financial breakdowns, annual summaries, and field audit documentation."
        />

        {/* 4 Pillars of SAFA Transparency */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
          <div className="p-5 rounded-xl bg-white border border-[#E2E8F0]">
            <div className="flex items-center gap-2 text-[#0D47A1] font-bold text-sm mb-2">
              <CheckCircle2 className="w-4 h-4 text-[#16A34A]" />
              <span>Reference-Backed Donations</span>
            </div>
            <p className="text-xs text-[#64748B] leading-relaxed">
              Every single public donation is registered on our live public ledger with a server-assigned reference code.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-white border border-[#E2E8F0]">
            <div className="flex items-center gap-2 text-[#0D47A1] font-bold text-sm mb-2">
              <CheckCircle2 className="w-4 h-4 text-[#16A34A]" />
              <span>Receipt Reconciled</span>
            </div>
            <p className="text-xs text-[#64748B] leading-relaxed">
              Expenditures for groceries, construction materials, and medical supplies are matched against verified vendor receipts.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-white border border-[#E2E8F0]">
            <div className="flex items-center gap-2 text-[#0D47A1] font-bold text-sm mb-2">
              <CheckCircle2 className="w-4 h-4 text-[#16A34A]" />
              <span>Beneficiary Privacy Safeguards</span>
            </div>
            <p className="text-xs text-[#64748B] leading-relaxed">
              Personal identifiable information, addresses, and phone numbers are redacted to preserve human dignity and safety.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-white border border-[#E2E8F0]">
            <div className="flex items-center gap-2 text-[#0D47A1] font-bold text-sm mb-2">
              <CheckCircle2 className="w-4 h-4 text-[#16A34A]" />
              <span>Role-Based Supervision</span>
            </div>
            <p className="text-xs text-[#64748B] leading-relaxed">
              Content is vetted through strict administrative stages: Draft &rarr; Review &rarr; Verified &rarr; Published.
            </p>
          </div>
        </div>

        {/* Reports Download List */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-xs p-6 sm:p-8 mb-12">
          <h3 className="text-xl font-bold text-[#172033] mb-2">
            Published Audit Documents & Annual Reports
          </h3>
          <p className="text-xs text-[#64748B] mb-6">
            Click to view or download official organizational PDF documents and transparency disclosures.
          </p>

          <div className="space-y-4">
            {reports.map(rep => (
              <div
                key={rep.id}
                className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-[#1565C0]/40 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#EAF4FF] text-[#0D47A1] flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                        {rep.category}
                      </span>
                      <span className="text-xs text-[#64748B]">{rep.publishedAt}</span>
                    </div>
                    <h4 className="text-sm font-bold text-[#172033] leading-snug">
                      {rep.title}
                    </h4>
                    <p className="text-xs text-[#64748B] mt-0.5">
                      {rep.summary}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => alert(`Downloading verified report: ${rep.title} (${rep.fileSize})`)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E2E8F0] bg-white text-xs font-bold text-[#0D47A1] hover:bg-[#EAF4FF] hover:border-[#1565C0] transition-colors shrink-0 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download ({rep.fileSize})</span>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Ledger CTA */}
        <div className="text-center p-8 bg-gradient-to-r from-[#0D47A1] to-[#1565C0] text-white rounded-2xl shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h4 className="text-lg font-bold mb-1">Audit the Live Contribution Ledger</h4>
            <p className="text-xs text-blue-100 max-w-md">
              Search and filter every completed donation reference code in real time.
            </p>
          </div>
          <Link to="/contributions/history">
            <Button variant="outline" size="md" className="bg-white text-[#0D47A1] hover:bg-blue-50 border-white">
              Open Contribution Ledger
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
