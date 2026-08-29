export interface SectionContent {
  heading: string;
  paragraphs?: string[];
  items?: string[];
}

export interface PageContent {
  title: string;
  description: string;
  eyebrow?: string;
  heading: string;
  lead?: string;
  sections: SectionContent[];
}

export interface LocaleContent {
  common: {
    home: string; tests: string; comparisons: string; methodology: string; services: string; about: string;
    contact: string; transparency: string; privacy: string; legal: string; categories: string;
    allTests: string; menuOpen: string; menuClose: string; mainNav: string; footerNav: string;
    language: string; skip: string; follow: string; followText: string; footerText: string;
    socialAria: string; linkSoon: string; readMore: string; contactCta: string;
  };
  home: {
    title: string; description: string; eyebrow: string; heading: string; lead: string; signature: string;
    testsCta: string; methodologyCta: string; methodEyebrow: string; methodHeading: string; methodLead: string;
    methods: Array<{ title: string; text: string }>;
    servicesEyebrow: string; servicesHeading: string; servicesLead: string;
    dossierEyebrow: string; dossierHeading: string; dossierText: string; dossierCta: string;
    fieldEyebrow: string; fieldHeading: string; fieldText: string;
    promiseEyebrow: string; promiseHeading: string; promiseText: string;
  };
  pages: Record<string, PageContent>;
  jibble: {
    title: string; description: string; category: string; heading: string; question: string; partial: string;
    verdictEyebrow: string; verdictHeading: string; verdictText: string; protocolHeading: string; protocolText: string;
    testedHeading: string; testedPlaceholder: string; notTestedHeading: string; notTestedPlaceholder: string;
    audienceHeading: string; audiencePlaceholder: string; avoidHeading: string; avoidPlaceholder: string;
    featuresHeading: string; featurePending: string; prosConsHeading: string; pros: string; cons: string; pending: string;
    sourcesHeading: string; sourcesText: string; alternativesHeading: string; alternativesText: string;
    faqHeading: string; faqs: Array<{ q: string; a: string }>; finalHeading: string; finalText: string;
    disclosureTitle: string; disclosureText: string; toc: string; methodologyLink: string;
    features: Record<string, string>; statusLabels: Record<string, string>;
  };
}
