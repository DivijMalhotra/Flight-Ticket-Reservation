import React from 'react';
import { motion } from 'framer-motion';
import { type LucideIcon } from 'lucide-react';

interface PageHeroProps {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  badge?: string;
}

/**
 * Reusable hero header matching the landing-page aesthetic.
 * Renders an ambient orange glow, a branded icon badge, title, and subtitle.
 */
const PageHero: React.FC<PageHeroProps> = ({ icon: Icon, title, subtitle, badge }) => (
  <section className="relative bg-surface-primary pt-10 pb-16 text-center overflow-hidden">
    {/* Ambient glow */}
    <div className="absolute inset-0 pointer-events-none">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-brand-500/[0.05] rounded-full blur-[100px]" />
      <div className="absolute bottom-0 right-0 w-[300px] h-[250px] bg-brand-500/[0.03] rounded-full blur-[80px]" />
    </div>

    <div className="container-app relative z-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {badge && (
          <div className="inline-flex items-center gap-2 bg-brand-500/10 border border-brand-500/20 rounded-full px-5 py-1.5 text-xs text-brand-500 mb-5">
            <span className="w-1.5 h-1.5 bg-brand-500 rounded-full animate-pulse" />
            {badge}
          </div>
        )}

        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-brand-500/10 border border-brand-500/20 mb-4">
          <Icon className="w-7 h-7 text-brand-500" />
        </div>

        <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight mb-2">
          {title}
        </h1>
        <p className="text-gray-400 text-sm max-w-md mx-auto">{subtitle}</p>
      </motion.div>
    </div>
  </section>
);

export default PageHero;
