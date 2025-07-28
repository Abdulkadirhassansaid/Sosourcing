
"use client";

import React, { createContext, useState, useContext, ReactNode } from 'react';

type Language = 'en' | 'so';

const translations = {
  en: {
    login: "Login",
    getStarted: "Get Started",
    hero: {
      headline: "We source, import and deliver your products to your doorstep.",
      cta1: "Start Your First Order",
      cta2: "How It Works",
    },
    trust: {
        indicators: [
            { value: "1,000+", label: "Products Sourced" },
            { value: "500+", label: "Happy Customers" },
            { value: "2", label: "Key Sourcing Markets" },
        ]
    },
    features: {
        title: "Your End-to-End Sourcing Solution",
        subtitle: "We streamline the entire process, from finding the perfect product to delivering it to your door in Somalia.",
        list: [
          {
            title: "Expert Sourcing",
            description: "Our global team finds the best products from trusted suppliers in Turkey, China, and more.",
          },
          {
            title: "Quality Assurance",
            description: "We inspect and verify every product to ensure it meets your quality standards before shipment.",
          },
          {
            title: "Competitive Pricing",
            description: "Leveraging our network, we negotiate the best factory prices to maximize your profit margins.",
          },
          {
            title: "Full-Service Logistics",
            description: "From factory floor to your doorstep in Somalia, we handle all shipping, customs, and clearance.",
          },
        ]
    },
    process: {
        title: "Get Your Products in 4 Simple Steps",
        subtitle: "A simple, transparent process to get you the products you need, delivered to Somalia.",
        steps: [
          { title: "1. Submit Your Request", description: "Tell us what product you need, including specifications and quantity." },
          { title: "2. Receive a Quote", description: "Our team sources suppliers and provides a detailed, all-inclusive quote." },
          { title: "3. Confirm & Pay", description: "Confirm the quote and make a secure payment through our platform." },
          { title: "4. We Deliver", description: "We handle production, quality control, and shipping to your doorstep." },
        ],
    },
    testimonials: {
        title: "Success Stories from Our Partners",
        list: [
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
    },
    footer: {
        about: "SomImports is your trusted partner for sourcing high-quality products for your business in Somalia. We handle everything from finding suppliers to final delivery.",
        newsletter: "Subscribe to our newsletter",
        subscribe: "Subscribe",
        links: "Quick Links",
        contact: "Contact Us",
        home: "Home",
        services: "Services",
        aboutUs: "About Us",
        rights: "All rights reserved.",
    }
  },
  so: {
    login: "Gal",
    getStarted: "Bilow",
    hero: {
      headline: "Waxaan keennaa, soo dejinnaa oo alaabtaada kuugu keenaa albaabkaaga.",
      cta1: "Bilow Dalabkaaga Kowaad",
      cta2: "Siduu u Shaqeeyaa",
    },
    trust: {
        indicators: [
            { value: "1,000+", label: "Alaab La Keenay" },
            { value: "500+", label: "Macaamiil Faraxsan" },
            { value: "2", label: "Suuqyada Wax Laga Keenno" },
        ]
    },
    features: {
        title: "Xalkaaga Wax Keenista oo Dhamaystiran",
        subtitle: "Waxaan fududeynaa habka oo dhan, laga bilaabo helitaanka alaabta ugu fiican ilaa keenista albaabkaaga Soomaaliya.",
        list: [
          {
            title: "Khabiir ku ah Wax Keenista",
            description: "Kooxdeena caalamiga ah waxay ka helayaan alaabada ugu fiican shirkadaha lagu kalsoon yahay ee Turkiga, Shiinaha, iyo meelo kale.",
          },
          {
            title: "Hubinta Tayada",
            description: "Waan kormeernaa oo xaqiijinnaa badeecad kasta si aan u hubinno inay buuxineyso heerarka tayadaada ka hor inta aan la soo rarin.",
          },
          {
            title: "Qiimo Tartan ah",
            description: "Anagoo ka faa'iideysaneyna shabakadeena, waxaan ka gorgortannaa qiimaha warshadda ugu fiican si aan u kordhinno faa'iidadaada.",
          },
          {
            title: "Adeeg Buuxa oo Saad",
            description: "Laga bilaabo warshadda ilaa albaabkaaga Soomaaliya, waxaan qabannaa dhammaan raridda, kastamka, iyo fasaxa.",
          },
        ]
    },
    process: {
        title: "Ku Hel Alaabtaada 4 Tallaabo oo Fudud",
        subtitle: "Hab fudud oo daah-furan si aad u hesho alaabta aad u baahan tahay, oo laguugu keeno Soomaaliya.",
        steps: [
          { title: "1. Soo Gudbi Codsigaaga", description: "Noo sheeg alaabta aad u baahan tahay, oo ay ku jiraan sifooyinka iyo tirada." },
          { title: "2. Hel Qiimo Bixin", description: "Kooxdeena ayaa raadiya alaab-qeybiyeyaal waxayna ku siinayaan qiimo-bixin faahfaahsan oo dhameystiran." },
          { title: "3. Xaqiiji & Bixi", description: "Xaqiiji qiimaha oo si ammaan ah ku bixi lacagta adigoo isticmaalaya barteena." },
          { title: "4. Waanu Keenaa", description: "Waxaan qabanaa wax soo saarka, hubinta tayada, iyo raridda ilaa albaabkaaga." },
        ],
    },
    testimonials: {
        title: "Sheekooyinka Guusha ee Wada-hawlgalayaasheena",
        list: [
          {
            name: "Aamina Xasan",
            role: "Milkiilaha Butiik, Muqdisho",
            quote: "SomImports waxay beddeshay ganacsigayga dharka. Hadda waxaan ka keeni karaa dhar tayo sare leh Turkiga qiimo aanan keligey heli karin. Kooxdoodu waa xirfadlayaal oo wax walba way qabtaan!",
            avatar: "AX",
            image: "https://placehold.co/100x100.png",
            dataAiHint: "woman portrait"
          },
          {
            name: "Cumar Yuusuf",
            role: "Ganacsade Elektaroonig, Hargeysa",
            quote: "Hubinta tayadu waa heer sare. Waxaan ka walwali jiray inaan helo elektaroonig cilladaysan oo Shiinaha ka yimid, laakiin SomImports, shixnad kastaa waa qumman tahay. Macaamiishaydu way ka faraxsan yihiin sidii hore.",
            avatar: "CY",
            image: "https://placehold.co/100x100.png",
            dataAiHint: "man portrait"
          },
          {
            name: "Faadumo Cali",
            role: "Alaab-qeybiye Qalabka Dhismaha, Kismaayo",
            quote: "Helitaanka alaab-qeybiyeyaal lagu kalsoonaan karo oo qalabka dhismaha ah waxay ahayd caqabad weyn. SomImports waxay igu xirtay iibiyeyaal waaweyn waxayna ka gorgortantay qiimo cajiib ah. Waa lammaane dhab ah oo korriin ah.",
            avatar: "FC",
            image: "https://placehold.co/100x100.png",
            dataAiHint: "woman smiling"
          },
        ],
    },
    footer: {
        about: "SomImports waa lammaanahaaga lagu kalsoon yahay ee soo iibinta alaabo tayo sare leh oo loogu talagalay ganacsigaaga Soomaaliya. Waxaan qabanaa wax walba laga bilaabo helitaanka alaab-qeybiyeyaasha ilaa keenista ugu dambeysa.",
        newsletter: "Iska diiwaan geli warsidaheena",
        subscribe: "Isdiiwaangeli",
        links: "Lingaxyada Degdega ah",
        contact: "Nala soo xiriir",
        home: "Guriga",
        services: "Adeegyada",
        aboutUs: "Nagu saabsan",
        rights: "Dhammaan xuquuqaha way xifdisan yihiin.",
    }
  },
};

type LanguageContextType = {
  language: Language;
  setLanguage: (language: Language) => void;
  content: typeof translations.en;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  const content = translations[language];

  return (
    <LanguageContext.Provider value={{ language, setLanguage, content }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
