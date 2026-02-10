import React, { useState } from 'react';
import { Upload, FileDown, FileSpreadsheet } from 'lucide-react';

export default function ImportCard({ onUpload, onDownloadTemplate }) {
    const [isDragging, setIsDragging] = useState(false);

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            onUpload({ target: { files: files } });
        }
    };
    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 mb-8">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-lg" style={{ backgroundColor: 'color-mix(in srgb, var(--brand-color), white 90%)', color: 'var(--brand-color)' }}>
                        <FileSpreadsheet size={20} strokeWidth={1.5} />
                    </div>
                    <div>
                        <h2 className="text-base font-semibold text-(--brand-color)">Import Payroll Data</h2>
                        <p className="text-sm text-slate-500 mt-0.5">Upload an Excel file containing employee payroll information.</p>
                    </div>
                </div>
                <button
                    onClick={onDownloadTemplate}
                    className="flex items-center gap-2 px-3 py-2 text-(--brand-color) bg-white hover:text-white border border-slate-200 transition-all text-sm font-medium shadow-sm cursor-pointer active:scale-[0.98]"
                    style={{ '--hover-color': 'var(--brand-color)' }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--brand-color)';
                        e.currentTarget.style.borderColor = 'var(--brand-color)';
                        e.currentTarget.style.color = 'white';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '';
                        e.currentTarget.style.borderColor = '';
                        e.currentTarget.style.color = 'var(--brand-color)';
                    }}
                >
                    <FileDown size={16} strokeWidth={2} />
                    Download Template
                </button>
            </div>

            <div className="relative group">
                <input
                    type="file"
                    accept=".xlsx, .xls"
                    onChange={onUpload}
                    className="hidden"
                    id="excel-upload-card"
                />
                <label
                    htmlFor="excel-upload-card"
                    className={`flex flex-col items-center justify-center w-full h-40 border border-dashed rounded-xl transition-all cursor-pointer group-hover:shadow-[0_2px_8px_rgba(0,0,0,0.04)]
                        ${isDragging
                            ? 'bg-[color-mix(in_srgb,var(--brand-color),white_90%)] border-(--brand-color)'
                            : 'border-slate-300 bg-slate-50/30 hover:bg-slate-50 hover:border-(--brand-color)'
                        }`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                >
                    <div className="p-3 bg-white rounded-full shadow-sm mb-3 border border-slate-100 group-hover:scale-110 transition-transform duration-200">
                        <Upload size={24} className="text-(--brand-color)" strokeWidth={1.5} />
                    </div>
                    <p className="text-sm font-semibold text-(--brand-color)">Click to upload or drag & drop</p>
                    <p className="text-xs text-slate-500 mt-1">Excel files (.xlsx, .xls)</p>
                </label>
            </div>
        </div>
    );
}
