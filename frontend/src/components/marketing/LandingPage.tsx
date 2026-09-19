'use client';

import React from 'react';
import Navbar from './Navbar';
import HeroSection from './HeroSection';
import CaelumOsSection from './CaelumOsSection';
import WhySection from './WhySection';
import EcosystemSection from './EcosystemSection';
import TechSection from './TechSection';
import RoadmapSection from './RoadmapSection';
import DocsSection from './DocsSection';
import OpenSourceSection from './OpenSourceSection';
import AboutSection from './AboutSection';
import Footer from './Footer';

export default function LandingPage() {
  return (
    <div id="top" className="min-h-screen bg-white text-slate-900 flex flex-col selection:bg-blue-600 selection:text-white">
      <Navbar />
      <main className="flex-1 w-full">
        <HeroSection />
        <CaelumOsSection />
        <WhySection />
        <EcosystemSection />
        <TechSection />
        <RoadmapSection />
        <DocsSection />
        <OpenSourceSection />
        <AboutSection />
      </main>
      <Footer />
    </div>
  );
}
