
"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Facebook, Twitter, Linkedin } from "lucide-react";
import { useLanguage } from "@/contexts/language-context";

export default function Footer() {
  const { content } = useLanguage();

  return (
    <footer className="bg-white/50 text-secondary-foreground pt-12 mt-16">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center mb-4">
                 <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="h-8 w-8 text-primary"
                    >
                    <path d="M12 2L1 9l4 1v9h3v-6h4v6h3v-9l4-1-11-7z" />
                    <path fill="none" d="M0 0h24v24H0z" />
                </svg>
              <span className="ml-2 text-xl font-bold">SomImports</span>
            </div>
            <p className="text-muted-foreground max-w-md">{content.footer.about}</p>
          </div>
          <div>
            <h3 className="font-semibold mb-4">{content.footer.links}</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-muted-foreground hover:text-primary">{content.footer.home}</a></li>
              <li><a href="#how-it-works" className="text-muted-foreground hover:text-primary">{content.footer.services}</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary">{content.footer.aboutUs}</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary">{content.footer.contact}</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4">{content.footer.newsletter}</h3>
            <div className="flex w-full max-w-sm items-center space-x-2">
              <Input type="email" placeholder="Email" />
              <Button type="submit" variant="default">{content.footer.subscribe}</Button>
            </div>
            <div className="flex space-x-4 mt-4">
              <a href="#" className="text-muted-foreground hover:text-primary"><Facebook /></a>
              <a href="#" className="text-muted-foreground hover:text-primary"><Twitter /></a>
              <a href="#" className="text-muted-foreground hover:text-primary"><Linkedin /></a>
            </div>
          </div>
        </div>
        <div className="mt-8 py-4 border-t border-border/50 text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} SomImports. {content.footer.rights}
        </div>
      </div>
    </footer>
  );
}
