import React, { useEffect } from 'react';
import { CheckCircle2, XCircle, X } from 'lucide-react';

export default function Toast({ message, type = 'success', onClose, duration = 3000 }) {
    useEffect(() => {
        if (duration) {
            const timer = setTimeout(() => {
                onClose();
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [duration, onClose]);

    return (
        <div className="fixed bottom-6 right-6 z-100 animate-in slide-in-from-bottom-5 fade-in duration-300">
            <div className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border ${type === 'success'
                    ? 'bg-white border-emerald-100 text-slate-800'
                    : 'bg-white border-rose-100 text-slate-800'
                }`}>
                <div className={`p-1 rounded-full ${type === 'success' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
                    }`}>
                    {type === 'success' ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
                </div>

                <p className="text-sm font-medium">{message}</p>

                <button
                    onClick={onClose}
                    className="ml-2 p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                    <X size={14} />
                </button>
            </div>
        </div>
    );
}
