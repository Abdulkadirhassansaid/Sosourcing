
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const content = {
    title: "Success Stories from Our Partners",
    testimonials: [
      {
        name: "Amina Hassan",
        role: "Boutique Owner, Mogadishu",
        quote: "SomImports transformed my fashion business. I can now source high-quality apparel from Turkey at prices I couldn't find on my own. Their team is professional and handles everything!",
        avatar: "AH",
        image: "https://placehold.co/100x100.png",
        dataAiHint: "woman portrait"
      },
      {
        name: "Omar Yusuf",
        role: "Electronics Retailer, Hargeisa",
        quote: "The quality assurance is top-notch. I used to worry about receiving faulty electronics from China, but with SomImports, every shipment is perfect. My customers are happier than ever.",
        avatar: "OY",
        image: "https://placehold.co/100x100.png",
        dataAiHint: "man portrait"
      },
      {
        name: "Fatima Ali",
        role: "Building Materials Supplier, Kismayo",
        quote: "Finding reliable suppliers for construction materials was a huge challenge. SomImports connected me with great vendors and negotiated incredible prices. They are a true partner for growth.",
        avatar: "FA",
        image: "https://placehold.co/100x100.png",
        dataAiHint: "woman smiling"
      },
    ],
};

export default function Testimonials() {
  const testimonials = content.testimonials;

  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">{content.title}</h2>
        </div>
        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full max-w-4xl mx-auto"
        >
          <CarouselContent>
            {testimonials.map((testimonial, index) => (
              <CarouselItem key={index} className="md:basis-1/2">
                <div className="p-1 h-full">
                  <Card className="h-full flex flex-col justify-between p-6 bg-white/40 backdrop-blur-lg border border-white/20 shadow-lg rounded-xl">
                    <CardContent className="p-0 flex flex-col h-full">
                      <blockquote className="text-muted-foreground mb-6 flex-grow text-lg">"{testimonial.quote}"</blockquote>
                      <div className="flex items-center gap-4 mt-auto">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={testimonial.image} alt={testimonial.name} data-ai-hint={testimonial.dataAiHint} />
                          <AvatarFallback>{testimonial.avatar}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold text-lg">{testimonial.name}</p>
                          <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </div>
    </section>
  );
}
