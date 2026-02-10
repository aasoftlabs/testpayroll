'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Calendar, ChevronDown, ChevronUp } from 'lucide-react';

export default function ReleaseList({ releases }) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-6 md:p-12 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <Link href="/" className="inline-flex items-center text-sm text-slate-500 hover:text-(--brand-color) transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-(--brand-color)">
              Release Notes
            </h1>
            <p className="text-slate-500 mt-2">
              History of improvements, fixes, and updates.
            </p>
          </div>
        </div>

        {/* Releases List */}
        <div className="space-y-6">
          {releases.map((release, index) => (
            <ReleaseCard key={release.version} release={release} defaultOpen={index === 0} />
          ))}
        </div>
      </div>
    </div>
  );
}

function ReleaseCard({ release, defaultOpen }) {
  // Sections state
  const [sections, setSections] = useState({
    improvements: defaultOpen && release.improvements.length > 0,
    fixes: defaultOpen && release.fixes.length > 0,
    patches: defaultOpen && release.patches.length > 0,
  });

  const toggleSection = (section) => {
    setSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm transition-all hover:border-slate-300 hover:shadow-md">
      {/* Card Header */}
      <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold text-slate-800">{release.version}</h2>
          {release.tag && (
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
              release.tag === 'LATEST' 
                ? 'bg-[color-mix(in_srgb,var(--brand-color),white_95%)] text-(--brand-color) border border-[color-mix(in_srgb,var(--brand-color),white_80%)]' 
                : 'bg-slate-100 text-slate-600'
            }`}>
              {release.tag}
            </span>
          )}
        </div>
        <div className="flex items-center text-sm text-slate-500">
          <Calendar className="w-4 h-4 mr-2" />
          {release.date}
        </div>
      </div>

      {/* Content */}
      <div className="divide-y divide-slate-100">
        <Section 
          title="Improvements" 
          count={release.improvements.length} 
          isOpen={sections.improvements} 
          onToggle={() => toggleSection('improvements')}
          items={release.improvements}
          colorClass="bg-emerald-500"
          textClass="text-slate-600"
        />
        <Section 
          title="Fixes" 
          count={release.fixes.length} 
          isOpen={sections.fixes} 
          onToggle={() => toggleSection('fixes')}
          items={release.fixes}
          colorClass="bg-amber-500"
          textClass="text-slate-600"
        />
        <Section 
          title="Patches" 
          count={release.patches.length} 
          isOpen={sections.patches} 
          onToggle={() => toggleSection('patches')}
          items={release.patches}
          colorClass="bg-blue-500"
          textClass="text-slate-600"
        />
      </div>
    </div>
  );
}

function formatText(text) {
  // Split by bold (**text**) and code (`text`) markers
  const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);
  
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={index} className="font-semibold text-slate-900">{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code key={index} className="bg-slate-100 px-1.5 py-0.5 rounded text-xs font-mono text-(--brand-color) border border-slate-200">
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
}

function Section({ title, count, isOpen, onToggle, items, colorClass, textClass }) {
  if (count === 0) return (
    <div className="px-6 py-4 flex items-center justify-between opacity-50 cursor-not-allowed">
      <span className="font-medium text-slate-400">{title}</span>
      <span className="text-sm text-slate-400">({count})</span>
    </div>
  );

  return (
    <div>
      <button 
        onClick={onToggle}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors group"
      >
        <span className={`font-medium group-hover:text-slate-900 transition-colors ${isOpen ? 'text-slate-800' : 'text-slate-600'}`}>
          {title}
        </span>
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-400">({count})</span>
          {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </div>
      </button>
      
      {isOpen && (
        <div className="px-6 pb-6 pt-2 animate-in slide-in-from-top-2 duration-200">
          <ul className="space-y-3">
            {items.map((item, i) => (
              <li key={i} className={`flex items-start text-sm ${textClass} leading-relaxed`}>
                <span className={`mr-3 mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${colorClass}`} />
                <span>{formatText(item)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
