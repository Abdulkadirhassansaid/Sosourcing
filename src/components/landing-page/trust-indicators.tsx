
"use client";

import { useLanguage } from "@/contexts/language-context";

export default function TrustIndicators() {
  const { content } = useLanguage();
  const indicators = content.trust.indicators;

  return (
    <section className="py-12 bg-background">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          {indicators.map((indicator, index) => (
            <div key={index} className="p-4 rounded-lg animate-fade-in-up" style={{ animationDelay: `${index * 200}ms` }}>
              <h3 className="text-5xl font-bold text-primary">{indicator.value}</h3>
              <p className="mt-2 text-lg text-muted-foreground">{indicator.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
