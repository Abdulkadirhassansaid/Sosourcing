
"use client";

import { ArrowRight } from "lucide-react";

const content = {
    title: "Get Your Products in 4 Simple Steps",
    subtitle: "A simple, transparent process to get you the products you need, delivered to Somalia.",
    steps: [
      { title: "1. Submit Your Request", description: "Tell us what product you need, including specifications and quantity." },
      { title: "2. Receive a Quote", description: "Our team sources suppliers and provides a detailed, all-inclusive quote." },
      { title: "3. Confirm & Pay", description: "Confirm the quote and make a secure payment through our platform." },
      { title: "4. We Deliver", description: "We handle production, quality control, and shipping to your doorstep." },
    ],
};

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-12 md:py-20 bg-background">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl font-headline">{content.title}</h2>
          <p className="mt-4 max-w-2xl mx-auto text-muted-foreground">{content.subtitle}</p>
        </div>
        <div className="relative grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-4 items-start">
          {content.steps.map((step, index) => (
            <div key={index} className="relative flex flex-col items-center text-center max-w-xs mx-auto animate-fade-in-up" style={{ animationDelay: `${index * 200}ms` }}>
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary text-primary-foreground text-2xl font-bold mb-4 z-10 shadow-lg">
                {index + 1}
              </div>
              <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
              <p className="text-muted-foreground">{step.description}</p>
              {index < content.steps.length - 1 && (
                <div className="hidden md:block absolute top-8 left-1/2 w-full h-0.5 bg-border -z-0">
                  <ArrowRight className="absolute top-1/2 -right-4 -translate-y-1/2 transform text-primary" size={24} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
