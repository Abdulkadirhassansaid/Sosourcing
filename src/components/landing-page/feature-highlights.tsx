
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Gem, Package, Search, ShieldCheck } from "lucide-react";

const content = {
    title: "Your End-to-End Sourcing Solution",
    subtitle: "We streamline the entire process, from finding the perfect product to delivering it to your door in Somalia.",
    features: [
      {
        icon: Search,
        title: "Expert Sourcing",
        description: "Our global team finds the best products from trusted suppliers in Turkey, China, and more.",
      },
      {
        icon: ShieldCheck,
        title: "Quality Assurance",
        description: "We inspect and verify every product to ensure it meets your quality standards before shipment.",
      },
      {
        icon: Gem,
        title: "Competitive Pricing",
        description: "Leveraging our network, we negotiate the best factory prices to maximize your profit margins.",
      },
      {
        icon: Package,
        title: "Full-Service Logistics",
        description: "From factory floor to your doorstep in Somalia, we handle all shipping, customs, and clearance.",
      },
    ],
};

export default function FeatureHighlights() {
  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">{content.title}</h2>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">{content.subtitle}</p>
        </div>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {content.features.map((feature, index) => (
            <Card
              key={index}
              className="bg-white/30 backdrop-blur-lg border border-white/20 shadow-lg rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-xl"
            >
              <CardHeader className="items-center">
                <div className="bg-primary/10 p-4 rounded-full">
                  <feature.icon className="h-8 w-8 text-primary" />
                </div>
              </CardHeader>
              <CardContent className="text-center">
                <CardTitle className="mb-2 text-xl font-semibold">{feature.title}</CardTitle>
                <p className="text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
