'use client'
import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Mail, Phone, ChevronDown } from 'lucide-react';

export default function SupportPage() {
    const [openIndex, setOpenIndex] = useState(null);

    const toggleFaq = (index) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    const faqs = [
        {
            question: "How do I verify my company email?",
            answer: "Go to Settings > Account Settings and click on the \"Verify Email\" button if your email is not yet verified. Check your inbox for the verification link."
        },
        {
            question: "Can I reset my password?",
            answer: "Yes, go to Settings > Security to send a password reset email, or click \"Forgot Password\" on the login screen."
        },
        {
            question: "How do I bulk download payslips?",
            answer: "After importing payroll data, select the employees you want (or all of them) and click the \"Download Selected\" or \"Download All\" button on the dashboard."
        },
        {
            question: "How do I send payslips via email in bulk?",
            answer: "Once you have generated the payslips, click the 'Send All' button on the dashboard. This will automatically email the payslips to all employees with valid email addresses."
        }
    ];

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 py-12">
            <div className="w-full px-4 sm:px-8 md:px-12 lg:px-32 mx-auto">
                <div className="mb-8">
                    <Link href="/" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-(--brand-color) transition-colors font-medium mb-4">
                        <ArrowLeft size={16} />
                        Back to Home
                    </Link>
                    <h1 className="text-3xl font-bold text-(--brand-color)">Support Center</h1>
                    <p className="text-slate-500 mt-2">How can we help you today?</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
                    {/* Left Column: Contact Info */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:border-(--brand-color) transition-colors">
                            <div className="p-3 bg-[color-mix(in_srgb,var(--brand-color),white_95%)] w-fit rounded-xl text-(--brand-color) mb-4">
                                <Mail size={24} />
                            </div>
                            <h3 className="text-lg font-semibold text-slate-900">Email Support</h3>
                            <p className="text-slate-500 text-sm mt-1 mb-4">Get in touch with our support team for detailed queries.</p>
                            <a href="mailto:support@techser.com" className="text-(--brand-color) font-medium text-sm hover:underline">
                                ashutosh@techser.com
                            </a>
                        </div>

                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:border-emerald-300 transition-colors">
                            <div className="p-3 bg-emerald-50 w-fit rounded-xl text-emerald-600 mb-4">
                                <Phone size={24} />
                            </div>
                            <h3 className="text-lg font-semibold text-slate-900">Phone Support</h3>
                            <p className="text-slate-500 text-sm mt-1 mb-4">Mon-Fri from 10am to 6pm for urgent issues.</p>
                            <a href="tel:+919448992154" className="text-emerald-600 font-medium text-sm hover:underline">
                                +91 9448992154
                            </a>
                        </div>
                    </div>

                    {/* Right Column: FAQ */}
                    <div className="lg:col-span-8">
                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 h-full">
                            <h2 className="text-xl font-bold text-slate-900 mb-6">Frequently Asked Questions</h2>

                            <div className="space-y-4">
                                {faqs.map((faq, index) => (
                                    <div key={index} className="border-b border-slate-100 last:border-0 pb-4 last:pb-0">
                                        <button
                                            onClick={() => toggleFaq(index)}
                                            className="w-full flex items-center justify-between py-2 text-left group"
                                        >
                                            <span className="font-semibold text-slate-800 group-hover:text-(--brand-color) transition-colors">
                                                {faq.question}
                                            </span>
                                            <ChevronDown
                                                size={20}
                                                className={`text-slate-400 transition-transform duration-200 ${openIndex === index ? 'rotate-180 text-(--brand-color)' : ''}`}
                                            />
                                        </button>

                                        <div
                                            className={`grid transition-all duration-200 ease-in-out ${openIndex === index ? 'grid-rows-[1fr] opacity-100 mt-2' : 'grid-rows-[0fr] opacity-0'}`}
                                        >
                                            <div className="overflow-hidden">
                                                <p className="text-slate-500 text-sm leading-relaxed">
                                                    {faq.answer}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
