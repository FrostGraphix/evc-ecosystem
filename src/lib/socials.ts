export type SocialId = "linkedin" | "x" | "facebook" | "instagram" | "youtube";

export interface Social {
  id: SocialId;
  name: string;
  handle: string;
  href: string;
}

/** Official EVC Nigeria social media accounts. Shared by navigation docks, footer links, and Organization JSON-LD. */
export const socials: Social[] = [
  {
    id: "linkedin",
    name: "LinkedIn",
    handle: "EVC Nigeria",
    href: "https://www.linkedin.com/company/evc-nigeria/",
  },
  {
    id: "x",
    name: "X (Twitter)",
    handle: "@evcnigeria",
    href: "https://x.com/evcnigeria",
  },
  {
    id: "facebook",
    name: "Facebook",
    handle: "@evcnigeria",
    href: "https://www.facebook.com/evcnigeria",
  },
  {
    id: "instagram",
    name: "Instagram",
    handle: "@evc_ng",
    href: "https://www.instagram.com/evc_ng/",
  },
  {
    id: "youtube",
    name: "YouTube",
    handle: "@evcnigeria",
    href: "https://www.youtube.com/@evcnigeria",
  },
];

export interface OfficialDomain {
  id: string;
  name: string;
  domain: string;
  url: string;
  description: string;
  audience: string;
}

/** Official EVC Nigeria domains and platforms across the ecosystem. */
export const officialDomains = {
  corporate: {
    id: "corporate",
    name: "EVC Corporate",
    domain: "evcng.com",
    url: "https://evcng.com",
    description: "Official corporate website, property portfolio, company news, and developments.",
    audience: "Public, Investors & Clients",
  },
  workspace: {
    id: "workspace",
    name: "EVC Workspace",
    domain: "workspace.evcng.com",
    url: "https://workspace.evcng.com",
    description: "Internal team collaboration, project management, ERP, and operational workflows.",
    audience: "Internal Staff & Operations",
  },
  portal: {
    id: "portal",
    name: "EVC Property Portal",
    domain: "portal.evcng.com",
    url: "https://portal.evcng.com",
    description: "Client property management portal, allocation tracking, and documentation.",
    audience: "Property Owners & Verified Clients",
  },
  webmail: {
    id: "webmail",
    name: "Corporate Webmail",
    domain: "mail.evcng.com",
    url: "https://mail.evcng.com",
    description: "Secure enterprise webmail gateway for @evcng.com corporate accounts.",
    audience: "Corporate Staff & Leadership",
  },
  ecosystem: {
    id: "ecosystem",
    name: "EVC Ecosystem Hub",
    domain: "ecosystem.evcng.com",
    url: "https://ecosystem.evcng.com",
    description: "Unified entry gateway and application launcher for all EVC digital surfaces.",
    audience: "All Audiences & Stakeholders",
  },
} as const;

export type OfficialDomainKey = keyof typeof officialDomains;

export const officialDomainsList: OfficialDomain[] = Object.values(officialDomains);
