'use client';

import React from 'react';
import Navbar from './Navbar';
import HeroSection from './HeroSection';
import WhatIsSection from './WhatIsSection';
import CloudWorkspaceSection from './CloudWorkspaceSection';
import CloudProvidersSection from './CloudProvidersSection';
import ContainersIacSection from './ContainersIacSection';
import DevEnvironmentSection from './DevEnvironmentSection';
import IntelligenceSection from './IntelligenceSection';
import ArchitectureSection from './ArchitectureSection';
import RoadmapSection from './RoadmapSection';
import OpenSourceSection from './OpenSourceSection';
import FutureOsSection from './FutureOsSection';
import CtaSection from './CtaSection';
import Footer from './Footer';

export default function LandingPage() {
  return (
    <div id="top" className="min-h-screen bg-white text-slate-900 flex flex-col selection:bg-blue-600 selection:text-white font-sans antialiased">
      {/* Top Global Navigation */}
      <Navbar />

      <main className="flex-1 w-full">
        {/* 1. Hero — CaleumOS */}
        <HeroSection />

        {/* 2. What is CaleumOS? */}
        <WhatIsSection />

        {/* 3. The Unified Cloud Workspace */}
        <CloudWorkspaceSection />

        {/* 4. AWS + Azure */}
        <CloudProvidersSection />

        {/* 5. Docker + Kubernetes + Terraform */}
        <ContainersIacSection />

        {/* 6. Developer Environment */}
        <DevEnvironmentSection />

        {/* 7. Caleum Intelligence (In Development) */}
        <IntelligenceSection />

        {/* 8. Technical Architecture */}
        <ArchitectureSection />

        {/* 9. Current / Building / Future Roadmap */}
        <RoadmapSection />

        {/* 10. GitHub / Open Source */}
        <OpenSourceSection />

        {/* 11. Future Native CaelumOS Vision */}
        <FutureOsSection />

        {/* 12. Final CTA */}
        <CtaSection />
      </main>

      {/* Global Footer */}
      <Footer />
    </div>
  );
}