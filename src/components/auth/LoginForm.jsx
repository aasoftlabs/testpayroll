import React, { useState } from 'react';
import Image from 'next/image';
import { ArrowRight, Eye, EyeOff, Loader2 } from 'lucide-react';

export default function LoginForm({
    handleLogin,
    loginPassword,
    setLoginPassword,
    errorMessage,
    companyProfile,
    resetPassword,
    showToast
}) {
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const onLogin = async () => {
        setIsLoading(true);
        try {
            await handleLogin();
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetPassword = async () => {
        if (!companyProfile?.hrEmail) {
            showToast("No HR Email configured for password reset.", "error");
            return;
        }
        try {
            await resetPassword(companyProfile.hrEmail);
            showToast('Password reset email sent to ' + companyProfile.hrEmail, "success");
        } catch (error) {
            showToast('Error sending reset email: ' + error.message, "error");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 relative font-sans">
            {/* Background Pattern */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                <div className="absolute -top-[40%] -left-[20%] w-[70vw] h-[70vw] rounded-full bg-blue-100 blur-3xl opacity-30 animate-blob"></div>
                <div className="absolute -bottom-[40%] -right-[20%] w-[70vw] h-[70vw] rounded-full bg-indigo-100 blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
            </div>

            <div className="w-full max-w-sm bg-white/90 backdrop-blur-xl rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/50 p-8 relative z-10 transition-all hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)]">
                <div className="text-center mb-8">
                    {companyProfile?.logoUrl ? (
                        <div className="w-80 h-16 mx-auto flex items-center justify-center mb-4 overflow-hidden relative">
                            <Image
                                src={companyProfile.logoUrl}
                                alt="Logo"
                                fill
                                className="object-contain"
                                sizes="64px"
                            />
                        </div>
                    ) : (
                        <div className="w-16 h-16 mx-auto bg-blue-600 rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-blue-200">
                            <span className="text-2xl font-bold text-white">T</span>
                        </div>
                    )}
                    <h2 className="text-xl font-bold text-slate-800">Welcome Back</h2>
                    <p className="text-xs text-slate-500 mt-1">Sign in to Techser Payroll</p>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1.5 ml-1">Password</label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                value={loginPassword}
                                onChange={(e) => setLoginPassword(e.target.value)}
                                className="w-full px-4 py-2.5 pr-10 text-sm font-medium text-slate-800 bg-slate-50/50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400"
                                placeholder="Enter your admin password"
                                onKeyDown={(e) => e.key === 'Enter' && onLogin()}
                                disabled={isLoading}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 focus:outline-none"
                                disabled={isLoading}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    {errorMessage && (
                        <div className="p-3 bg-red-50 border border-red-100 rounded-lg flex items-center gap-2 animate-shake">
                            <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                            <p className="text-xs text-red-600 font-medium">{errorMessage}</p>
                        </div>
                    )}

                    <button
                        onClick={onLogin}
                        disabled={isLoading}
                        className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg shadow-lg shadow-blue-200 hover:shadow-xl hover:shadow-blue-300 transition-all active:scale-[0.98] flex items-center justify-center gap-2 group cursor-pointer"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 size={16} className="animate-spin" />
                                Signing In...
                            </>
                        ) : (
                            <>
                                Sign In
                                <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                            </>
                        )}
                    </button>

                    <div className="text-center mt-4">
                        <button
                            onClick={handleResetPassword}
                            className="text-xs text-slate-500 hover:text-blue-600 transition-colors cursor-pointer"
                        >
                            Forgot Password?
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
