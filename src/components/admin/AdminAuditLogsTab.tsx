import React, { useState } from 'react';
import { History, Search, Filter, ShieldCheck, User, Calendar } from 'lucide-react';
import { storage } from '../../services/storage';
import { Card } from '../ui/Card';

export const AdminAuditLogsTab: React.FC = () => {
  const auditLogs = storage.getAuditLogs();
  const [search, setSearch] = useState('');
  const [entityFilter, setEntityFilter] = useState('all');

  const entities = ['all', ...Array.from(new Set(auditLogs.map(l => l.entity)))];

  const filteredLogs = auditLogs.filter(log => {
    const matchesEntity = entityFilter === 'all' || log.entity === entityFilter;
    const matchesSearch = !search ||
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      log.userName.toLowerCase().includes(search.toLowerCase()) ||
      log.details.toLowerCase().includes(search.toLowerCase());
    return matchesEntity && matchesSearch;
  });

  return (
    <div className="space-y-8 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white border border-[#E5E0D5] shadow-2xs">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#5E6E52]/10 text-[#5E6E52] text-xs font-semibold uppercase tracking-wider mb-2">
            <History className="w-4 h-4" />
            <span>Immutable Platform Audit Trail</span>
          </div>
          <h2 className="text-2xl font-serif font-bold text-[#3D3B36]">
            Activity & Governance Log
          </h2>
          <p className="text-xs text-[#6D6A61] mt-1 max-w-xl leading-relaxed">
            Every administrative action—including article publication, role assignments, financial reconciliation, and invitation dispatches—is permanently recorded.
          </p>
        </div>
      </div>

      {/* Filter & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-[#F1EDE4] border border-[#E5E0D5]">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {entities.map(e => (
            <button
              key={e}
              onClick={() => setEntityFilter(e)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all whitespace-nowrap ${
                entityFilter === e
                  ? 'bg-[#5E6E52] text-white shadow-xs'
                  : 'bg-white text-[#6D6A61] hover:text-[#3D3B36] border border-[#E5E0D5]'
              }`}
            >
              {e === 'all' ? 'All Operations' : e}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-[#6D6A61] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search activity by actor or detail..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-full border border-[#E5E0D5] bg-white text-xs text-[#3D3B36] outline-hidden focus:border-[#5E6E52]"
          />
        </div>
      </div>

      {/* Logs Table */}
      <Card className="p-6 bg-white border border-[#E5E0D5] rounded-3xl shadow-2xs space-y-3">
        {filteredLogs.length === 0 ? (
          <p className="text-xs text-[#6D6A61] py-8 text-center">No logs match your filter criteria.</p>
        ) : (
          <div className="divide-y divide-[#E5E0D5]">
            {filteredLogs.map(log => (
              <div key={log.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-sm text-[#3D3B36]">{log.action}</span>
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-[#F1EDE4] text-[#6D6A61] border border-[#E5E0D5]">
                      {log.entity}
                    </span>
                    {log.entityId && (
                      <span className="text-[10px] font-mono text-[#6D6A61]">
                        #{log.entityId}
                      </span>
                    )}
                  </div>
                  <p className="text-[#6D6A61] text-xs leading-relaxed max-w-2xl">
                    {log.details}
                  </p>
                </div>

                <div className="text-left sm:text-right shrink-0 space-y-0.5">
                  <div className="flex items-center sm:justify-end gap-1.5 font-semibold text-[#3D3B36]">
                    <User className="w-3.5 h-3.5 text-[#5E6E52]" />
                    <span>{log.userName}</span>
                    <span className="text-[10px] uppercase font-bold text-[#6D6A61]">({log.userRole})</span>
                  </div>
                  <div className="text-[11px] text-[#6D6A61]">
                    {new Date(log.timestamp).toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};
