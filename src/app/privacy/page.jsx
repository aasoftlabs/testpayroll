import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 py-12">
            <div className="w-full px-4 sm:px-8 md:px-12 lg:px-32 mx-auto">
                <div className="mb-8">
                    <Link href="/" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-(--brand-color) transition-colors font-medium mb-4">
                        <ArrowLeft size={16} />
                        Back to Home
                    </Link>
                    <h1 className="text-3xl font-bold text-(--brand-color)">Privacy Policy</h1>
                    <p className="text-slate-500 mt-2">Last updated: {new Date().toLocaleDateString()}</p>
                </div>

                <div className="prose prose-slate max-w-none">
                    <h3>1. Information We Collect</h3>
                    <p>
                        We collect information you provide directly to us, such as company details, employee data (including payroll information), and contact information when you use our payroll services.
                    </p>

                    <h3>2. How We Use Your Information</h3>
                    <p>
                        We use the information we collect to operate, maintain, and provide the features of our payroll services, allowing you to generate payslips, manage employee data, and process payroll efficiently.
                    </p>

                    <h3>3. Data Security</h3>
                    <p>
                        We take reasonable measures to protect your company&apos;s data from unauthorized access, use, or disclosure. However, no internet-based service is completely secure.
                    </p>

                    <h3>4. Data Sharing</h3>
                    <p>
                        We do not share your company&apos;s or your employees&apos; personal data with third parties, except as required by law or to provide the specific services you have requested (e.g., email delivery services for sending payslips).
                    </p>

                    <h3>5. Your Rights</h3>
                    <p>
                        You have the right to access, correct, or delete your personal information. You may also update your company profile settings directly within the application.
                    </p>

                    <h3>6. Contact Us</h3>
                    <p>
                        If you have any questions about this Privacy Policy, please contact us at ashutosh@techser.com.
                    </p>
                </div>
            </div>
        </div>
    );
}
