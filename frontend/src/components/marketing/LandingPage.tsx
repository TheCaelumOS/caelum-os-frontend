'use client';

import React from 'react';
import Navbar from './Navbar';
import HeroSection from './HeroSection';
import PlatformSection from './PlatformSection';
import WhySection from './WhySection';
import EcosystemSection from './EcosystemSection';
import ExperienceSection from './ExperienceSection';
import AiVisionSection from './AiVisionSection';
import OpenSourceSection from './OpenSourceSection';
import RoadmapSection from './RoadmapSection';
import DocsSection from './DocsSection';
import CtaSection from './CtaSection';
import Footer from './Footer';

export default function LandingPage() {
  return (
    <div id="top" className="min-h-screen bg-white text-slate-900 flex flex-col selection:bg-blue-600 selection:text-white font-sans antialiased">
      <Navbar />
      <main className="flex-1 w-full">
        <HeroSection />
        <PlatformSection />
        <WhySection />
        <EcosystemSection />
        <ExperienceSection />
        <AiVisionSection />
        <OpenSourceSection />
        <RoadmapSection />
        <DocsSection />
        <CtaSection />
      </main>
      <Footer />
    </div>
  );
}
