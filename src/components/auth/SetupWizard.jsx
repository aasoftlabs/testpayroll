import React from 'react';
import { Building2, Palette, Shield, Phone, MapPin, ImageIcon, Mail, ArrowRight, ArrowLeft, Server, Lock } from 'lucide-react';

export default function SetupWizard({
    step,
    setStep,
    setupForm,
    setSetupForm,
    errorMessage,
    handleSetupSubmit,
    handleLogoUpload
}) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 font-sans">
            {/* Professional Background Pattern */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                <div className="absolute -top-[40%] -left-[20%] w-[70vw] h-[70vw] rounded-full bg-blue-100 blur-3xl opacity-30 animate-blob"></div>
                <div className="absolute -bottom-[40%] -right-[20%] w-[70vw] h-[70vw] rounded-full bg-indigo-100 blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
            </div>

            <div className="w-full max-w-3xl bg-white/90 backdrop-blur-xl rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/50 relative overflow-hidden">
                <div className="p-5">
                    <h1 className="text-xl font-bold text-slate-800 mb-2">Setup Company Profile</h1>
                    <p className="text-xs text-slate-500 mb-6">Complete your business identity and secure your account.</p>

                    {/* Step Indicators */}
                    <div className="flex gap-4 mb-6">
                        <div className={`flex items-center gap-3 px-4 py-3 rounded-lg ${step === 1 ? 'bg-blue-50 border-2 border-blue-500' : 'bg-slate-50'}`}>
                            <Building2 className={step === 1 ? 'text-blue-600' : 'text-slate-400'} size={20} />
                            <div>
                                <div className="text-xs text-slate-500">STEP 1</div>
                                <div className={`text-xs font-semibold ${step === 1 ? 'text-blue-600' : 'text-slate-600'}`}>Company</div>
                            </div>
                        </div>
                        <div className={`flex items-center gap-3 px-4 py-3 rounded-lg ${step === 2 ? 'bg-blue-50 border-2 border-blue-500' : 'bg-slate-50'}`}>
                            <Palette className={step === 2 ? 'text-blue-600' : 'text-slate-400'} size={20} />
                            <div>
                                <div className="text-xs text-slate-500">STEP 2</div>
                                <div className={`text-xs font-semibold ${step === 2 ? 'text-blue-600' : 'text-slate-600'}`}>Branding</div>
                            </div>
                        </div>
                        <div className={`flex items-center gap-3 px-4 py-3 rounded-lg ${step === 3 ? 'bg-blue-50 border-2 border-blue-500' : 'bg-slate-50'}`}>
                            <Shield className={step === 3 ? 'text-blue-600' : 'text-slate-400'} size={20} />
                            <div>
                                <div className="text-xs text-slate-500">STEP 3</div>
                                <div className={`text-xs font-semibold ${step === 3 ? 'text-blue-600' : 'text-slate-600'}`}>Admin</div>
                            </div>
                        </div>
                        <div className={`flex items-center gap-3 px-4 py-3 rounded-lg ${step === 4 ? 'bg-blue-50 border-2 border-blue-500' : 'bg-slate-50'}`}>
                            <Server className={step === 4 ? 'text-blue-600' : 'text-slate-400'} size={20} />
                            <div>
                                <div className="text-xs text-slate-500">STEP 4</div>
                                <div className={`text-xs font-semibold ${step === 4 ? 'text-blue-600' : 'text-slate-600'}`}>SMTP</div>
                            </div>
                        </div>
                    </div>

                    {/* Content Area */}
                    <div className="bg-white rounded-lg border-2 border-slate-100 p-6">
                        {/* STEP 1: Company Info */}
                        {step === 1 && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-slate-700 mb-1">Company Name</label>
                                        <div className="relative">
                                            <Building2 className="absolute left-3 top-2.5 text-slate-400" size={18} />
                                            <input
                                                type="text"
                                                placeholder="e.g. Techser"
                                                value={setupForm.companyName}
                                                onChange={(e) => setSetupForm({ ...setupForm, companyName: e.target.value })}
                                                className="w-full pl-10 pr-3 py-2 text-sm font-medium text-slate-800 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition placeholder:text-slate-400"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-700 mb-1">Business Phone</label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-2.5 text-slate-400" size={18} />
                                            <input
                                                type="text"
                                                placeholder="e.g. +1 (555) 000-0000"
                                                value={setupForm.businessPhone}
                                                onChange={(e) => setSetupForm({ ...setupForm, businessPhone: e.target.value })}
                                                className="w-full pl-10 pr-3 py-2 text-sm font-medium text-slate-800 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition placeholder:text-slate-400"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-slate-700 mb-1">Company Address</label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-2.5 text-slate-400" size={18} />
                                        <textarea
                                            placeholder="123 Business St, Suite 100, City, Country"
                                            value={setupForm.companyAddress}
                                            onChange={(e) => setSetupForm({ ...setupForm, companyAddress: e.target.value })}
                                            rows={3}
                                            className="w-full pl-10 pr-3 px-3 py-2 text-sm font-medium text-slate-800 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition resize-none placeholder:text-slate-400"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* STEP 2: Branding */}
                        {step === 2 && (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-medium text-slate-700 mb-1">Upload Company Logo</label>
                                    <div className="relative">
                                        <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center bg-slate-50 hover:bg-slate-100 transition cursor-pointer">
                                            {setupForm.logoPreview ? (
                                                <div className="flex flex-col items-center">
                                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                                    <img src={setupForm.logoPreview} alt="Logo Preview" className="h-16 mb-2" />
                                                    <button
                                                        onClick={() => setSetupForm({ ...setupForm, logoFile: null, logoPreview: '' })}
                                                        className="text-xs text-red-600 hover:underline"
                                                    >
                                                        Remove
                                                    </button>
                                                </div>
                                            ) : (
                                                <>
                                                    <ImageIcon className="mx-auto text-slate-400 mb-2" size={32} />
                                                    <p className="text-xs text-slate-600 font-medium mb-1">Drag and drop your logo file here or click to browse.</p>
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={handleLogoUpload}
                                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                                    />
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-slate-700 mb-1">Brand Accent Color</label>
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="w-10 h-10 rounded-lg border-2 border-slate-300 shadow-sm"
                                            style={{ backgroundColor: setupForm.brandColor }}
                                        />
                                        <input
                                            type="text"
                                            value={setupForm.brandColor}
                                            onChange={(e) => setSetupForm({ ...setupForm, brandColor: e.target.value })}
                                            className="flex-1 px-3 py-2 text-sm font-medium text-slate-800 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition placeholder:text-slate-400"
                                            placeholder="#3b82f6"
                                        />
                                        <input
                                            type="color"
                                            value={setupForm.brandColor}
                                            onChange={(e) => setSetupForm({ ...setupForm, brandColor: e.target.value })}
                                            className="w-10 h-10 cursor-pointer"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* STEP 3: Credentials */}
                        {step === 3 && (
                            <div className="space-y-4">
                                <div className="bg-blue-50 border-l-4 border-blue-500 p-3 rounded-lg flex items-start gap-3 mb-4">
                                    <Shield className="text-blue-600 mt-0.5" size={18} />
                                    <p className="text-xs text-blue-800">
                                        Set up the primary administrator account for your company profile. This email will be used for logins.
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-slate-700 mb-1">Admin Email Address</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-2.5 text-slate-400" size={18} />
                                        <input
                                            type="email"
                                            placeholder="admin@company.com"
                                            value={setupForm.adminEmail}
                                            onChange={(e) => setSetupForm({ ...setupForm, adminEmail: e.target.value })}
                                            className="w-full pl-10 pr-3 py-2 text-sm font-medium text-slate-800 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition placeholder:text-slate-400"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-slate-700 mb-1">Password</label>
                                    <input
                                        type="password"
                                        placeholder="Min. 6 characters"
                                        value={setupForm.password}
                                        onChange={(e) => setSetupForm({ ...setupForm, password: e.target.value })}
                                        className="w-full px-3 py-2 text-sm font-medium text-slate-800 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition placeholder:text-slate-400"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-700 mb-1">Confirm Password</label>
                                    <input
                                        type="password"
                                        placeholder="Re-enter password"
                                        value={setupForm.confirmPassword}
                                        onChange={(e) => setSetupForm({ ...setupForm, confirmPassword: e.target.value })}
                                        className="w-full px-3 py-2 text-sm font-medium text-slate-800 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition placeholder:text-slate-400"
                                    />
                                </div>
                            </div>
                        )}

                        {/* STEP 4: SMTP Configuration */}
                        {step === 4 && (
                            <div className="space-y-4">
                                <div className="bg-amber-50 border-l-4 border-amber-500 p-3 rounded-lg flex items-start gap-3 mb-4">
                                    <Server className="text-amber-600 mt-0.5" size={18} />
                                    <p className="text-xs text-amber-800">
                                        Configure your SMTP server to enable email notifications and payslip delivery.
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-slate-700 mb-1">SMTP Host</label>
                                        <div className="relative">
                                            <Server className="absolute left-3 top-2.5 text-slate-400" size={18} />
                                            <input
                                                type="text"
                                                placeholder="smtp.example.com"
                                                value={setupForm.smtpHost}
                                                onChange={(e) => setSetupForm({ ...setupForm, smtpHost: e.target.value })}
                                                className="w-full pl-10 pr-3 py-2 text-sm font-medium text-slate-800 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition placeholder:text-slate-400"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-700 mb-1">SMTP Port</label>
                                        <div className="relative">
                                            <div className="absolute left-3 top-2.5 text-slate-400 text-xs font-bold">#</div>
                                            <input
                                                type="text"
                                                placeholder="587"
                                                value={setupForm.smtpPort}
                                                onChange={(e) => setSetupForm({ ...setupForm, smtpPort: e.target.value })}
                                                className="w-full pl-10 pr-3 py-2 text-sm font-medium text-slate-800 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition placeholder:text-slate-400"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-slate-700 mb-1">Username</label>
                                        <input
                                            type="text"
                                            placeholder="email@example.com"
                                            value={setupForm.smtpUser}
                                            onChange={(e) => setSetupForm({ ...setupForm, smtpUser: e.target.value })}
                                            className="w-full px-3 py-2 text-sm font-medium text-slate-800 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition placeholder:text-slate-400"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-700 mb-1">Password</label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-2.5 text-slate-400" size={18} />
                                            <input
                                                type="password"
                                                placeholder="SMTP Password"
                                                value={setupForm.smtpPassword}
                                                onChange={(e) => setSetupForm({ ...setupForm, smtpPassword: e.target.value })}
                                                className="w-full pl-10 pr-3 py-2 text-sm font-medium text-slate-800 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition placeholder:text-slate-400"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 mt-2">
                                    <input
                                        type="checkbox"
                                        id="smtpSecure"
                                        checked={setupForm.smtpSecure}
                                        onChange={(e) => setSetupForm({ ...setupForm, smtpSecure: e.target.checked })}
                                        className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                                    />
                                    <label htmlFor="smtpSecure" className="text-sm text-slate-700">
                                        Use Secure Connection (SSL/TLS)
                                    </label>
                                </div>
                            </div>
                        )}

                        {errorMessage && (
                            <div className="mt-4 p-3 bg-red-50 text-red-600 text-xs font-semibold rounded-lg border border-red-100 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                                {errorMessage}
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer Controls */}
                <div className="p-5 border-t border-slate-100 bg-slate-50 flex justify-between items-center">
                    {step > 1 ? (
                        <button
                            onClick={() => setStep(step - 1)}
                            className="text-slate-500 px-4 py-2 hover:bg-slate-200 rounded-lg text-xs font-bold transition flex items-center gap-2 cursor-pointer"
                        >
                            <ArrowLeft size={16} />
                            BACK
                        </button>
                    ) : (
                        <div></div>
                    )}
                    <button
                        onClick={handleSetupSubmit}
                        className="bg-blue-600 text-white px-6 py-2.5 rounded-lg text-xs font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition flex items-center gap-2 cursor-pointer"
                    >
                        {step === 4 ? 'COMPLETE SETUP' : 'NEXT STEP'}
                        {step !== 4 && <ArrowRight size={16} />}
                    </button>
                </div>
            </div>
        </div>
    );
}
