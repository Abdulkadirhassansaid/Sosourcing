
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Gem, Package, Search, ShieldCheck } from "lucide-react";
import { useLanguage } from "@/contexts/language-context";

const icons = [Search, ShieldCheck, Gem, Package];

export default function FeatureHighlights() {
  const { content } = useLanguage();
  const features = content.features.list;

  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">{content.features.title}</h2>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">{content.features.subtitle}</p>
        </div>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => {
            const Icon = icons[index];
            return (
              <Card
                key={index}
                className="bg-card/60 dark:bg-card/30 backdrop-blur-lg border border-border/20 shadow-lg rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-xl hover:border-border/40"
              >
                <CardHeader className="items-center">
                  <div className="bg-primary/10 p-4 rounded-full">
                    <Icon className="h-8 w-8 text-primary" />
                  </div>
                </CardHeader>
                <CardContent className="text-center">
                  <CardTitle className="mb-2 text-xl font-semibold">{feature.title}</CardTitle>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  );
}
