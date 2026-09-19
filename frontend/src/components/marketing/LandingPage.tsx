'use client';

import React from 'react';
import Navbar from './Navbar';
import HeroSection from './HeroSection';
import ProblemSection from './ProblemSection';
import MeetCaelumSection from './MeetCaelumSection';
import PlatformSection from './PlatformSection';
import ExperienceSection from './ExperienceSection';
import WhySection from './WhySection';
import VisionSection from './VisionSection';
import AiVisionSection from './AiVisionSection';
import BootableOsSection from './BootableOsSection';
import RoadmapSection from './RoadmapSection';
import DocsSection from './DocsSection';
import WhoIsItForSection from './WhoIsItForSection';
import AboutSection from './AboutSection';
import CtaSection from './CtaSection';
import Footer from './Footer';

export default function LandingPage() {
  return (
    <div id="top" className="min-h-screen bg-[#09090b] text-slate-100 flex flex-col selection:bg-cyan-500/30 selection:text-cyan-200">
      <Navbar />
      <main className="flex-1 w-full">
        <HeroSection />
        <ProblemSection />
        <MeetCaelumSection />
        <PlatformSection />
        <ExperienceSection />
        <WhySection />
        <VisionSection />
        <AiVisionSection />
        <BootableOsSection />
        <RoadmapSection />
        <DocsSection />
        <WhoIsItForSection />
        <AboutSection />
        <CtaSection />
      </main>
      <Footer />
    </div>
  );
}
