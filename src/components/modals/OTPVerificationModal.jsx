import React, { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';

export default function OTPVerificationModal({ isOpen, onClose, onVerify }) {
    const [otp, setOtp] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleOtpChange = (e) => {
        const value = e.target.value.replace(/\D/g, ''); // Only digits
        if (value.length <= 6) {
            setOtp(value);
            setError('');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (otp.length !== 6) {
            setError('Please enter a 6-digit OTP');
            return;
        }

        setIsVerifying(true);
        setError('');

        try {
            const response = await fetch('/api/verify-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ otp }),
            });

            const data = await response.json();

            if (response.ok && data.success) {
                onVerify(true);
                setOtp('');
            } else {
                setError(data.error || 'OTP verification failed');
                setIsVerifying(false);
            }
        } catch (err) {
            console.error('OTP verification error:', err);
            setError('Network error. Please try again.');
            setIsVerifying(false);
        }
    };

    const handleClose = () => {
        if (!isVerifying) {
            setOtp('');
            setError('');
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-60 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
                <div className="flex items-center justify-between p-6 border-b border-slate-100">
                    <h2 className="text-lg font-bold text-slate-800">Verify OTP</h2>
                    <button
                        onClick={handleClose}
                        disabled={isVerifying}
                        className="p-2 hover:bg-slate-100 rounded-full transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <X size={20} className="text-slate-500" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6">
                    <div className="mb-6">
                        <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg mb-4">
                            <AlertTriangle size={20} className="text-amber-600 shrink-0 mt-0.5" />
                            <div className="text-sm text-amber-800">
                                <p className="font-semibold mb-1">OTP Verification Required</p>
                                <p>Enter the 6-digit OTP code to proceed with deleting your company profile. This action cannot be undone.</p>
                            </div>
                        </div>

                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Enter 6-Digit OTP
                        </label>
                        <input
                            type="text"
                            inputMode="numeric"
                            pattern="\d{6}"
                            maxLength={6}
                            value={otp}
                            onChange={handleOtpChange}
                            autoFocus
                            disabled={isVerifying}
                            placeholder="000000"
                            className="w-full px-4 py-3 text-2xl font-mono text-center text-slate-800 border-2 border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none tracking-widest disabled:bg-slate-50 disabled:cursor-not-allowed"
                        />
                        
                        {error && (
                            <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                                <AlertTriangle size={14} />
                                {error}
                            </p>
                        )}
                    </div>

                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={handleClose}
                            disabled={isVerifying}
                            className="flex-1 px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isVerifying || otp.length !== 6}
                            className="flex-1 px-6 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-sm transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isVerifying ? 'Verifying...' : 'Verify & Delete'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
