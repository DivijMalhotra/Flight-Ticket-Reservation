import React from 'react';
import { SignUp } from '@clerk/clerk-react';
import { motion } from 'framer-motion';
import { Plane } from 'lucide-react';

const SignUpPage: React.FC = () => {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-brand-500/10 border border-brand-500/20 mb-4">
            <Plane className="w-7 h-7 text-brand-500" />
          </div>
          <h1 className="text-2xl font-bold text-white">Create your account</h1>
          <p className="text-gray-400 text-sm mt-1">Start booking flights in minutes</p>
        </div>
        <SignUp
          routing="path"
          path="/sign-up"
          afterSignUpUrl="/dashboard"
          appearance={{
            elements: {
              rootBox: 'w-full',
              card: 'bg-surface-card border border-[#2a2a3a] shadow-none rounded-2xl',
              headerTitle: 'text-white',
              headerSubtitle: 'text-gray-400',
              socialButtonsBlockButton: 'bg-white/5 border-[#2a2a3a] text-white hover:bg-white/10',
              formFieldLabel: 'text-gray-400',
              formFieldInput: 'bg-[#1c1c28] border-[#2a2a3a] text-white',
              formButtonPrimary: 'bg-brand-500 hover:bg-brand-600',
              footerActionLink: 'text-brand-500 hover:text-brand-400',
              dividerLine: 'bg-[#2a2a3a]',
              dividerText: 'text-gray-500',
            },
          }}
        />
      </motion.div>
    </div>
  );
};

export default SignUpPage;
