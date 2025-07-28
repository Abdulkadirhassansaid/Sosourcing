
"use client";

import { useState, type FC } from "react";
import Header from "@/components/landing-page/header";
import HeroSection from "@/components/landing-page/hero-section";
import TrustIndicators from "@/components/landing-page/trust-indicators";
import FeatureHighlights from "@/components/landing-page/feature-highlights";
import HowItWorks from "@/components/landing-page/how-it-works";
import Testimonials from "@/components/landing-page/testimonials";
import Footer from "@/components/landing-page/footer";

const Home: FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground font-sans">
      <Header />
      <main className="flex-grow">
        <HeroSection />
        <TrustIndicators />
        <FeatureHighlights />
        <HowItWorks />
        <Testimonials />
      </main>
      <Footer />
    </div>
  );
};

export default Home;
