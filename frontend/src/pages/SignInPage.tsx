import React from 'react';
import { SignIn } from '@clerk/clerk-react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';

/* ───────────────────── Decorative corner grid ───────────────────── */
const DottedGrid: React.FC<{ className?: string }> = ({ className }) => (
  <div className={`absolute ${className}`}>
    <svg width="72" height="72" viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg">
      {Array.from({ length: 36 }).map((_, i) => {
        const col = i % 6;
        const row = Math.floor(i / 6);
        return (
          <rect
            key={i}
            x={col * 14}
            y={row * 14}
            width="3"
            height="3"
            rx="1.5"
            fill="rgba(99,102,241,0.35)"
          />
        );
      })}
    </svg>
  </div>
);

/* ───────────────────── Corner L-bracket ───────────────────── */
const CornerBracket: React.FC<{ className?: string; rotate?: number }> = ({ className, rotate = 0 }) => (
  <div className={`absolute ${className}`} style={{ transform: `rotate(${rotate}deg)` }}>
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M0 0 L32 0" stroke="rgba(99,102,241,0.3)" strokeWidth="1" />
      <path d="M0 0 L0 32" stroke="rgba(99,102,241,0.3)" strokeWidth="1" />
      <circle cx="0" cy="0" r="2.5" fill="rgba(99,102,241,0.5)" />
    </svg>
  </div>
);

/* ───────────────────── Floating dot ───────────────────── */
const FloatingDot: React.FC<{ className?: string }> = ({ className }) => (
  <div className={`absolute w-1.5 h-1.5 rounded-full bg-indigo-400/50 ${className}`} />
);

const SignInPage: React.FC = () => {
  const [params] = useSearchParams();
  const redirectUrl = params.get('redirect_url') || '/';

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden"
         style={{ background: 'linear-gradient(135deg, #0a0a1a 0%, #0d1117 40%, #0a0e1a 70%, #0f0a1a 100%)' }}>

      {/* ── Subtle grid overlay ── */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(99,102,241,0.5) 1px, transparent 1px),
            linear-gradient(90deg, rgba(99,102,241,0.5) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />

      {/* ── Radial glow behind the card ── */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div
          className="w-[600px] h-[600px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)',
          }}
        />
      </div>

      {/* ── Decorative elements ── */}
      <DottedGrid className="top-[12%] left-[8%]" />
      <DottedGrid className="bottom-[12%] right-[8%]" />
      <DottedGrid className="bottom-[15%] left-[6%] opacity-60" />
      <DottedGrid className="top-[15%] right-[6%] opacity-60" />

      <CornerBracket className="top-[20%] left-[15%]" rotate={0} />
      <CornerBracket className="top-[20%] right-[15%]" rotate={90} />
      <CornerBracket className="bottom-[20%] left-[15%]" rotate={270} />
      <CornerBracket className="bottom-[20%] right-[15%]" rotate={180} />

      <FloatingDot className="top-[30%] left-[30%]" />
      <FloatingDot className="top-[25%] right-[35%]" />
      <FloatingDot className="bottom-[30%] left-[25%]" />
      <FloatingDot className="bottom-[25%] right-[30%]" />

      {/* ── Main card ── */}
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-md px-4"
      >
        <SignIn
          routing="path"
          path="/sign-in"
          afterSignInUrl={redirectUrl}
          appearance={{
            elements: {
              rootBox: 'w-full',
              card: 'bg-[#111128]/80 backdrop-blur-xl border border-indigo-500/15 shadow-2xl shadow-indigo-500/5 rounded-2xl',
              headerTitle: 'text-white font-bold',
              headerSubtitle: 'text-gray-400',
              socialButtonsBlockButton:
                'bg-indigo-500/10 border border-indigo-500/20 text-white hover:bg-indigo-500/20 transition-all',
              socialButtonsBlockButtonText: 'text-white font-medium',
              formFieldLabel: 'text-gray-400',
              formFieldInput:
                'bg-[#0d0d20] border border-indigo-500/15 text-white focus:border-indigo-500/40 focus:ring-1 focus:ring-indigo-500/30',
              formButtonPrimary:
                'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-lg shadow-indigo-500/20 transition-all',
              footerActionLink: 'text-indigo-400 hover:text-indigo-300',
              dividerLine: 'bg-indigo-500/15',
              dividerText: 'text-gray-500',
              footer: 'text-gray-500',
            },
          }}
        />
      </motion.div>
    </div>
  );
};

export default SignInPage;
