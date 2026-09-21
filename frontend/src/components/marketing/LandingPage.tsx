'use client';

import React from 'react';
import Navbar from './Navbar';
import HeroSection from './HeroSection';
import CapabilityStrip from './CapabilityStrip';
import IndustryStandardSection from './IndustryStandardSection';
import ToolsGridSection from './ToolsGridSection';
import PlatformsSection from './PlatformsSection';
import ArchitectureSection from './ArchitectureSection';
import CaelumOsBootableSection from './CaelumOsBootableSection';
import BlogNewsSection from './BlogNewsSection';
import DocsCommunitySection from './DocsCommunitySection';
import RoadmapSection from './RoadmapSection';
import Footer from './Footer';

export default function LandingPage() {
  return (
    <div id="top" className="min-h-screen bg-white text-slate-900 flex flex-col selection:bg-blue-600 selection:text-white font-sans antialiased">
      {/* 1. Global Navigation Header */}
      <Navbar />

      <main className="flex-1 w-full">
        {/* 2. Hero Section (Two-column with Caelum Laptop Workstation visual) */}
        <HeroSection />

        {/* 3. Horizontal Capability Strip (Cloud, Containers, Infra, Dev, Monitoring, Security) */}
        <CapabilityStrip />

        {/* 4. The Industry Standard: Built for the modern developer (5 Columns) */}
        <IndustryStandardSection />

        {/* 5. All The Tools You Need (16 Recognizable Tool SVGs) */}
        <ToolsGridSection />

        {/* 6. Supported Platforms (Desktop, Laptop, Bootable OS, Cloud, VMs, Containers, ARM) */}
        <PlatformsSection />

        {/* 7. Caelum Architecture (8 Modular Engineering Subsystems) */}
        <ArchitectureSection />

        {/* 8. CaelumOS Bootable Section (Dedicated Informational, IN DEVELOPMENT) */}
        <CaelumOsBootableSection />

        {/* 9. Latest News From Our Blog (2 Release Milestone Cards) */}
        <BlogNewsSection />

        {/* 10. Documentation & Community Hub */}
        <DocsCommunitySection />

        {/* 11. Project Roadmap (8 Transparent Engineering Stages) */}
        <RoadmapSection />
      </main>

      {/* 12. Large Dark Footer with Light/Dark Switcher */}
      <Footer />
    </div>
  );
}