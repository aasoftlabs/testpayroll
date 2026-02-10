import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 py-12">
            <div className="w-full px-4 sm:px-8 md:px-12 lg:px-32 mx-auto">
                <div className="mb-8">
                    <Link href="/" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-(--brand-color) transition-colors font-medium mb-4">
                        <ArrowLeft size={16} />
                        Back to Home
                    </Link>
                    <h1 className="text-3xl font-bold text-(--brand-color)">Terms of Service</h1>
                    <p className="text-slate-500 mt-2">Last updated: {new Date().toLocaleDateString()}</p>
                </div>

                <div className="prose prose-slate max-w-none">
                    <h3>1. Acceptance of Terms</h3>
                    <p>
                        By accessing or using our payroll management services, you agree to be bound by these Terms of Service and all applicable laws and regulations.
                    </p>

                    <h3>2. Use License</h3>
                    <p>
                        We grant you a limited, non-exclusive, non-transferable license to use our software for your company&apos;s internal business operations (specifically for payroll management).
                    </p>

                    <h3>3. Disclaimer</h3>
                    <p>
                        The materials on our website and application are provided on an &apos;as is&apos; basis. We make no warranties, expressed or implied, regarding the accuracy or reliability of the calculations, although we strive for precision.
                    </p>

                    <h3>4. Limitations</h3>
                    <p>
                        In no event shall we or our suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use our services.
                    </p>

                    <h3>5. Accuracy of Materials</h3>
                    <p>
                        You are responsible for verifying the accuracy of all data input into the system, including employee salaries, deductions, and tax information. We are not responsible for errors resulting from incorrect data entry.
                    </p>

                    <h3>6. Modifications</h3>
                    <p>
                        We may revise these terms of service at any time without notice. By using this website you are agreeing to be bound by the then current version of these terms of service.
                    </p>
                </div>
            </div>
        </div>
    );
}
