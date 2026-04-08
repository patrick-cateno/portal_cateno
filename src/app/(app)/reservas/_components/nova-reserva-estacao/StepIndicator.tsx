'use client';

import { Check } from 'lucide-react';

interface StepIndicatorProps {
  steps: string[];
  current: number; // 1-based
}

export function StepIndicator({ steps, current }: StepIndicatorProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 32 }}>
      {steps.map((label, i) => {
        const stepNum = i + 1;
        const isCompleted = stepNum < current;
        const isActive = stepNum === current;

        return (
          <div
            key={label}
            style={{
              display: 'flex',
              alignItems: 'center',
              flex: i < steps.length - 1 ? 1 : undefined,
            }}
          >
            {/* Circle */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 14,
                  fontWeight: 600,
                  fontFamily: 'Inter, sans-serif',
                  background: isCompleted || isActive ? '#0D9488' : '#E2E8F0',
                  color: isCompleted || isActive ? '#FFFFFF' : '#64748B',
                  transition: 'all 0.25s ease',
                }}
              >
                {isCompleted ? <Check size={16} /> : stepNum}
              </div>
              <span
                style={{
                  fontSize: 12,
                  fontWeight: isActive ? 600 : 400,
                  color: isActive ? '#0D9488' : '#64748B',
                  fontFamily: 'Inter, sans-serif',
                  whiteSpace: 'nowrap',
                }}
              >
                {label}
              </span>
            </div>

            {/* Connecting line */}
            {i < steps.length - 1 && (
              <div
                style={{
                  flex: 1,
                  height: 2,
                  background: isCompleted ? '#0D9488' : '#E2E8F0',
                  marginLeft: 8,
                  marginRight: 8,
                  marginBottom: 22,
                  transition: 'all 0.25s ease',
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
