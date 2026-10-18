/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Server,
  ShieldAlert,
  ShieldCheck,
  Search,
  ExternalLink,
  Layers,
  Lock,
  RotateCw
} from 'lucide-react';
import { Asset } from '../../types';

interface AssetInventoryViewProps {
  assets: Asset[];
  onSelectIncident: (id: string) => void;
}

export const AssetInventoryView: React.FC<AssetInventoryViewProps> = ({
  assets,
  onSelectIncident
}) => {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<string>('ALL');

  const filtered = assets.filter(a => {
    const matchesSearch =
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.arnOrId.toLowerCase().includes(search.toLowerCase()) ||
      a.owner.toLowerCase().includes(search.toLowerCase());
    const matchesType = filterType === 'ALL' || a.type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-wide flex items-center gap-2">
            <Server className="w-5 h-5 text-cyan-400" />
            ENTERPRISE ASSET INVENTORY
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Monitored cloud resources, storage buckets, IAM identities, and vulnerability blast radius mapping.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search assets, ARNs, owners..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
            />
          </div>

          <select
            value={filterType}
            onChange={e => setFilterType(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 font-mono focus:outline-none"
          >
            <option value="ALL">All Asset Types</option>
            <option value="S3">S3 Buckets</option>
            <option value="IAM_ROLE">IAM Roles & Users</option>
            <option value="KUBERNETES">Kubernetes Clusters</option>
            <option value="RDS">RDS Databases</option>
            <option value="API_GATEWAY">API Gateways</option>
          </select>
        </div>
      </div>

      {/* Asset Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(asset => {
          const isCompromised = asset.status !== 'HEALTHY';
          return (
            <div
              key={asset.id}
              className={`cyber-panel p-4 rounded-xl space-y-3 transition-all ${
                isCompromised
                  ? 'border-rose-800/60 shadow-sm shadow-rose-950/40'
                  : 'hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-slate-900 border border-slate-800 text-cyan-400 font-bold">
                  {asset.type}
                </span>
                <span
                  className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded ${
                    asset.criticality === 'CRITICAL'
                      ? 'bg-rose-950 text-rose-300'
                      : asset.criticality === 'HIGH'
                      ? 'bg-amber-950 text-amber-300'
                      : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {asset.criticality} CRITICALITY
                </span>
              </div>

              <div>
                <h4 className="text-sm font-bold text-white font-mono break-all">{asset.name}</h4>
                <p className="text-[11px] text-slate-400 font-mono mt-1 break-all">{asset.arnOrId}</p>
              </div>

              <div className="space-y-1 text-xs border-t border-slate-800/80 pt-2 font-mono">
                <div className="flex justify-between text-slate-400">
                  <span>Region:</span>
                  <span className="text-slate-200">{asset.region}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Owner:</span>
                  <span className="text-slate-200 truncate max-w-[180px]">{asset.owner}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Status:</span>
                  <span
                    className={`font-bold ${
                      asset.status === 'HEALTHY'
                        ? 'text-emerald-400'
                        : asset.status === 'ISOLATED'
                        ? 'text-cyan-400'
                        : 'text-rose-400'
                    }`}
                  >
                    {asset.status}
                  </span>
                </div>
              </div>

              {/* Associated Incidents */}
              {asset.associatedIncidents.length > 0 && (
                <div className="bg-rose-950/30 p-2.5 rounded-lg border border-rose-900/40 space-y-1">
                  <span className="text-[10px] font-mono text-rose-300 font-bold block">
                    Active Case Linkage:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {asset.associatedIncidents.map(incId => (
                      <button
                        key={incId}
                        onClick={() => onSelectIncident(incId)}
                        className="px-1.5 py-0.2 rounded bg-rose-900/60 text-rose-200 text-[10px] font-mono hover:underline"
                      >
                        {incId}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
