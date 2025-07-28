
"use client"

import * as React from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ArrowRight, BookOpen, MessageSquare, Phone, Search, Video, LifeBuoy, Wallet, Settings, Truck } from 'lucide-react';
import Link from 'next/link';
import { WhatsappIcon } from '@/components/ui/payment-icons';

const helpCategories = [
  { title: 'Getting Started', href: '#', description: 'Guides for new users to get acquainted with the platform.', icon: BookOpen },
  { title: 'Managing Orders', href: '/dashboard/orders', description: 'Learn how to create, manage, and track your orders.', icon: Truck },
  { title: 'Payments & Billing', href: '/dashboard/billing', description: 'Understand invoices, payments, and billing details.', icon: Wallet },
  { title: 'Shipping & Delivery', href: '#', description: 'Everything about tracking orders, shipping, and delivery to Somalia.', icon: BookOpen },
  { title: 'Video Tutorials', href: '#', description: 'Watch step-by-step guides on using our platform.', icon: Video },
  { title: 'Account Settings', href: '/dashboard/settings', description: 'Manage your profile, notifications, and security.', icon: Settings },
];

const faqs = [
  {
    question: 'How long does it take to get a quote for my order?',
    answer: 'Typically, you can expect to receive initial quotes from our sourcing agents within 48-72 hours after submitting a detailed order. This may vary based on the complexity of your request.'
  },
  {
    question: 'What are the payment options available?',
    answer: 'We accept various payment methods including bank transfers, credit cards, and popular mobile money services. You can view all available options on the payment page for an order.'
  },
  {
    question: 'Can I request a sample before placing a bulk order?',
    answer: 'Yes, we highly recommend it. You can request samples directly from the sourcing results page. Our agents will coordinate with the supplier to have samples sent to you.'
  },
  {
    question: 'What is your quality assurance process?',
    answer: 'We offer comprehensive quality assurance services, including factory audits, during-production inspections, and pre-shipment inspections. You can request these services to ensure products meet your standards.'
  },
];

export default function HelpCenterPage() {
  return (
    <div className="space-y-8">
      <header className="text-center py-8 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/30 rounded-lg">
        <h1 className="text-4xl font-bold tracking-tight">How can we help you?</h1>
        <p className="text-muted-foreground mt-2">Find answers, tutorials, and get in touch with our support team.</p>
        <div className="mt-6 max-w-lg mx-auto">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input placeholder="Search the help center..." className="pl-10 h-12 text-base" />
            </div>
        </div>
      </header>

      <section>
        <h2 className="text-2xl font-bold mb-6 text-center">Browse Help Topics</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {helpCategories.map((category) => (
                <Card key={category.title} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="flex flex-row items-center gap-4">
                        <div className="p-3 bg-primary/10 rounded-lg">
                            <category.icon className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <CardTitle>{category.title}</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <CardDescription>{category.description}</CardDescription>
                        <Button variant="link" className="px-0 mt-2" asChild>
                           <Link href={category.href} className="flex items-center">
                             Learn More <ArrowRight className="ml-2 h-4 w-4" />
                           </Link>
                        </Button>
                    </CardContent>
                </Card>
            ))}
        </div>
      </section>

      <section>
          <h2 className="text-2xl font-bold mb-6 text-center">Frequently Asked Questions</h2>
          <Card>
              <CardContent className="p-6">
                <Accordion type="single" collapsible className="w-full">
                    {faqs.map((faq, index) => (
                        <AccordionItem key={index} value={`item-${index}`}>
                            <AccordionTrigger className="text-lg text-left">{faq.question}</AccordionTrigger>
                            <AccordionContent className="text-muted-foreground text-base">
                            {faq.answer}
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
              </CardContent>
          </Card>
      </section>
      
      <section>
        <h2 className="text-2xl font-bold mb-6 text-center">Still Need Help?</h2>
        <div className="grid md:grid-cols-2 gap-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><MessageSquare /> Live Chat</CardTitle>
                    <CardDescription>Get instant answers from our support specialists. (Coming Soon)</CardDescription>
                </CardHeader>
                <CardContent>
                    <Button disabled>Start Chat</Button>
                </CardContent>
            </Card>
             <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><WhatsappIcon className="h-6 w-6" /> WhatsApp Support</CardTitle>
                    <CardDescription>Chat with us directly on WhatsApp for a quick response.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Button asChild>
                        <Link href="https://wa.me/252613471566" target="_blank">
                            Chat on WhatsApp <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
      </section>

    </div>
  );
}
