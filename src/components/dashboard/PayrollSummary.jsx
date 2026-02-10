import React from 'react';
import {
    RotateCcw,
    Send,
    Download,
    Wallet,
    Users,
    PiggyBank,
    ShieldCheck,
    Landmark,
    Building2
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export default function PayrollSummary({
    employees,
    onReset,
    onSendAll,
    onDownloadAll,
    isSending,
    sendingProgress,
    selectedCount = 0
}) {
    // Calculate totals
    const totals = employees.reduce((acc, emp) => {
        const gross = Number(emp['GROSS SALARY'] || 0);
        const net = Number(emp['Net Pay'] || 0);
        const pf = Number(emp['PROV.FUND'] || 0);
        const esi = Number(emp['ESI'] || 0);
        const tds = Number(emp['TDS'] || 0);
        const pt = Number(emp['P.Tax'] || 0);

        return {
            gross: acc.gross + gross,
            net: acc.net + net,
            pf: acc.pf + pf,
            esi: acc.esi + esi,
            tds: acc.tds + tds,
            pt: acc.pt + pt
        };
    }, { gross: 0, net: 0, pf: 0, esi: 0, tds: 0, pt: 0 });

    const stats = [
        { label: 'Payroll Cost', value: totals.gross, icon: Wallet, color: 'text-blue-600', bg: 'bg-blue-50/50' },
        { label: 'Net Pay', value: totals.net, icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-50/50' },
        { label: 'PF Deduction', value: totals.pf, icon: PiggyBank, color: 'text-amber-600', bg: 'bg-amber-50/50' },
        { label: 'PT Deduction', value: totals.pt, icon: Building2, color: 'text-orange-600', bg: 'bg-orange-50/50' },
        { label: 'ESI Deduction', value: totals.esi, icon: ShieldCheck, color: 'text-purple-600', bg: 'bg-purple-50/50' },
        { label: 'TDS Deduction', value: totals.tds, icon: Landmark, color: 'text-rose-600', bg: 'bg-rose-50/50' },
    ];

    return (
        <div className="space-y-6 mb-8">
            {/* Header / Actions */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-6">
                <div>
                    <h2 className="text-2xl font-bold text-(--brand-color)">Payroll Dashboard</h2>
                    <p className="text-slate-500 text-sm">Overview of current payroll processing</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={onReset}
                        className="flex items-center gap-2 px-3 py-2 text-red-600 bg-white hover:bg-red-600 hover:text-white border border-red-200 hover:border-red-600 rounded-lg transition-all text-sm font-medium shadow-sm cursor-pointer active:scale-[0.98]"
                    >
                        <RotateCcw size={16} strokeWidth={2} />
                        Reset Data
                    </button>
                    <button
                        onClick={onSendAll}
                        disabled={isSending || employees.length === 0}
                        className={`flex items-center gap-2 px-3 py-2 font-medium rounded-lg transition-all shadow-sm cursor-pointer text-sm active:scale-[0.98] ${isSending || employees.length === 0
                            ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                            : 'bg-white text-indigo-600 border border-indigo-200 hover:bg-indigo-600 hover:text-white hover:border-indigo-600'
                            }`}
                    >
                        <Send size={16} strokeWidth={2} />
                        {isSending ? 'Sending...' : (selectedCount > 0 ? `Send Selected (${selectedCount})` : 'Send All')}
                    </button>
                    <button
                        onClick={onDownloadAll}
                        disabled={employees.length === 0}
                        className={`flex items-center gap-2 px-3 py-2 font-medium rounded-lg transition-all shadow-sm cursor-pointer text-sm active:scale-[0.98] ${employees.length === 0
                            ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                            : 'bg-white text-emerald-600 border border-emerald-200 hover:bg-emerald-600 hover:text-white hover:border-emerald-600'
                            }`}
                    >
                        <Download size={16} strokeWidth={2} />
                        {selectedCount > 0 ? `Download Selected (${selectedCount})` : 'Download All'}
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
                {stats.map((stat, idx) => (
                    <div key={idx} className="bg-white p-3 rounded-xl border border-slate-200 shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex flex-col gap-3 hover:border-slate-300 transition-colors">
                        <div className={`p-2.5 w-fit rounded-lg ${stat.bg} ${stat.color}`}>
                            <stat.icon size={18} strokeWidth={2} />
                        </div>
                        <div>
                            <p className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">{stat.label}</p>
                            <h3 className="text-base font-bold text-slate-800 mt-0.5">{formatCurrency(stat.value)}</h3>
                        </div>
                    </div>
                ))}
            </div>

            {/* Sending Progress Bar */}
            {isSending && (
                <div className="bg-white p-6 rounded-xl shadow-sm border border-indigo-100 animate-in fade-in slide-in-from-top-2">
                    <div className="flex justify-between text-sm mb-2">
                        <span className="font-medium text-slate-700">Sending Payslips...</span>
                        <span className="text-indigo-600 font-bold">{Math.round((sendingProgress.current / sendingProgress.total) * 100)}%</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-indigo-600 rounded-full transition-all duration-300 ease-out"
                            style={{ width: `${(sendingProgress.current / sendingProgress.total) * 100}%` }}
                        ></div>
                    </div>
                    <p className="text-xs text-slate-500 mt-2 text-center font-medium">Sent {sendingProgress.current} of {sendingProgress.total} emails</p>
                </div>
            )}
        </div>
    );
}
