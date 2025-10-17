'use client';

import * as React from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AgentDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  agentName: string;
  agentIcon: string;
  purpose: string;
  features: string[];
  personality: string[];
  useCases: string[];
  themeColor: string;
}

export function AgentDetailModal({
  isOpen,
  onClose,
  agentName,
  agentIcon,
  purpose,
  features,
  personality,
  useCases,
  themeColor,
}: AgentDetailModalProps) {
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with gradient */}
        <div
          className="relative px-8 pt-8 pb-6"
          style={{
            background: `linear-gradient(135deg, hsl(${themeColor} / 0.1) 0%, hsl(${themeColor} / 0.05) 100%)`,
          }}
        >
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2 rounded-full hover:bg-black/5 transition-colors"
            aria-label="Close modal"
          >
            <X className="h-5 w-5 text-gray-600" />
          </button>

          <div className="flex items-center gap-4">
            <div
              className="text-5xl p-4 rounded-2xl"
              style={{
                background: `hsl(${themeColor} / 0.15)`,
              }}
            >
              {agentIcon}
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900">{agentName}</h2>
              <p className="text-gray-600 mt-1">{purpose}</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-8 py-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          {/* Features */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span
                className="w-1.5 h-6 rounded-full"
                style={{ background: `hsl(${themeColor})` }}
              />
              Key Features
            </h3>
            <ul className="space-y-3">
              {features.map((feature, index) => (
                <li key={index} className="flex items-start gap-3">
                  <span
                    className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0"
                    style={{ background: `hsl(${themeColor})` }}
                  />
                  <span className="text-gray-700 leading-relaxed">{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Personality */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span
                className="w-1.5 h-6 rounded-full"
                style={{ background: `hsl(${themeColor})` }}
              />
              Agent Personality
            </h3>
            <div className="flex flex-wrap gap-2">
              {personality.map((trait, index) => (
                <span
                  key={index}
                  className="px-4 py-2 rounded-full text-sm font-medium border"
                  style={{
                    background: `hsl(${themeColor} / 0.1)`,
                    borderColor: `hsl(${themeColor} / 0.3)`,
                    color: `hsl(${themeColor.split(' ')[0]} 60% 35%)`,
                  }}
                >
                  {trait}
                </span>
              ))}
            </div>
          </div>

          {/* Use Cases */}
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span
                className="w-1.5 h-6 rounded-full"
                style={{ background: `hsl(${themeColor})` }}
              />
              Perfect For
            </h3>
            <ul className="space-y-3">
              {useCases.map((useCase, index) => (
                <li key={index} className="flex items-start gap-3">
                  <span
                    className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0"
                    style={{ background: `hsl(${themeColor})` }}
                  />
                  <span className="text-gray-700 leading-relaxed">{useCase}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-6 bg-gray-50 border-t border-gray-100">
          <p className="text-sm text-gray-600 text-center">
            Ready to try it? Click <span className="font-semibold">"Call Agent"</span> to experience a live demo.
          </p>
        </div>
      </div>
    </div>
  );
}

