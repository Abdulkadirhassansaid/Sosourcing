
"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useLanguage } from "@/contexts/language-context";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

const LanguageToggle = () => {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center space-x-2">
      <Label htmlFor="language-switch" className={language === 'en' ? 'font-bold' : ''}>EN</Label>
      <Switch
        id="language-switch"
        checked={language === 'so'}
        onCheckedChange={(checked) => setLanguage(checked ? 'so' : 'en')}
      />
      <Label htmlFor="language-switch" className={language === 'so' ? 'font-bold' : ''}>SO</Label>
    </div>
  );
};

export default function Header() {
  const [isOpen, setIsOpen] = React.useState(false);
  const { content } = useLanguage();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center justify-between">
        <div className="flex">
          <Link href="/" className="flex items-center space-x-2">
            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-6 w-6 text-primary"
                >
                <path d="M12 2L1 9l4 1v9h3v-6h4v6h3v-9l4-1-11-7z" />
            </svg>
            <span className="font-bold">SomImports</span>
          </Link>
        </div>
        
        {/* Desktop Menu */}
        <div className="hidden md:flex flex-1 items-center justify-end space-x-2 md:space-x-4">
          <LanguageToggle />
          <ThemeToggle />
          <Button asChild variant="ghost" size="sm">
            <Link href="/login">{content.login}</Link>
          </Button>
          <Button asChild size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90">
            <Link href="/signup">{content.getStarted}</Link>
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <div className="flex md:hidden">
            <Button variant="default" size="icon" onClick={() => setIsOpen(!isOpen)} className="bg-accent text-accent-foreground hover:bg-accent/90 flex items-center justify-center">
                {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                <span className="sr-only">Toggle menu</span>
            </Button>
        </div>
      </div>

       {/* Mobile Menu Content */}
      {isOpen && (
        <div className="md:hidden">
          <div className="container flex flex-col items-start gap-4 pb-4">
             <LanguageToggle />
             <ThemeToggle />
             <Button asChild variant="ghost" className="w-full justify-start text-base">
                <Link href="/login" onClick={() => setIsOpen(false)}>{content.login}</Link>
             </Button>
             <Button asChild className="w-full bg-accent text-accent-foreground hover:bg-accent/90 text-base">
                <Link href="/signup" onClick={() => setIsOpen(false)}>{content.getStarted}</Link>
             </Button>
          </div>
        </div>
      )}
    </header>
  );
}
