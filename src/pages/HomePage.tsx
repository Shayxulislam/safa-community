import React from 'react';
import { HeroSection } from '../components/home/HeroSection';
import { ImpactStatsSection } from '../components/home/ImpactStatsSection';
import { AboutSection } from '../components/home/AboutSection';
import { MissionSection } from '../components/home/MissionSection';
import { FounderSection } from '../components/home/FounderSection';
import { PieceOfOurWorkSection } from '../components/home/PieceOfOurWorkSection';
import { StoriesSection } from '../components/home/StoriesSection';
import { TransparencySection } from '../components/home/TransparencySection';
import { SupportSection } from '../components/home/SupportSection';
import { SocialContactSection } from '../components/home/SocialContactSection';

export const HomePage: React.FC = () => {
  return (
    <div className="w-full">
      <HeroSection />
      <ImpactStatsSection />
      <AboutSection />
      <MissionSection />
      <FounderSection />
      <PieceOfOurWorkSection />
      <StoriesSection />
      <TransparencySection />
      <SupportSection />
      <SocialContactSection />
    </div>
  );
};
