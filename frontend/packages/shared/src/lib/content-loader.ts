import rawLandingMd from "../content/landing.md?raw";

export interface LandingHero {
  badge: string;
  badgeIcon: string;
  headline: string;
  subheadline: string;
  ctaPrimaryText: string;
  ctaPrimaryUrl: string;
  ctaSecondaryText: string;
  ctaSecondaryUrl: string;
  ctaChooseText: string;
  ctaChooseUrl: string;
  heroImage: string;
  trustBadge: string;
}

export interface LandingStat {
  label: string;
  value: string;
  sub: string;
}

export interface LandingFeature {
  id: string;
  badge: string;
  title: string;
  description: string;
  icon: string;
}

export interface LandingSector {
  id: string;
  name: string;
  title: string;
  desc: string;
  projectsCount: number;
  color: string;
  image: string;
}

export interface LandingStep {
  step: string;
  title: string;
  desc: string;
}

export interface LandingGuarantee {
  title: string;
  desc: string;
  icon: string;
}

export interface LandingFaq {
  q: string;
  a: string;
}

export interface LandingFooterLink {
  label: string;
  url: string;
}

export interface LandingData {
  title: string;
  hero: LandingHero;
  stats: LandingStat[];
  features: LandingFeature[];
  sectors: LandingSector[];
  howItWorks: {
    title: string;
    subtitle: string;
    steps: LandingStep[];
  };
  guarantees: {
    badge: string;
    title: string;
    subtitle: string;
    items: LandingGuarantee[];
  };
  faqs: LandingFaq[];
  footer: {
    brand: string;
    tagline: string;
    locations: string;
    links: {
      ecosystem: { title: string; items: LandingFooterLink[] };
      portals: { title: string; items: LandingFooterLink[] };
      legal: { title: string; items: LandingFooterLink[] };
    };
  };
  markdownContent: string;
}

/**
 * Simple, robust YAML frontmatter parser for Astro-like markdown content
 */
function parseYamlValue(val: string): any {
  val = val.trim();
  if (val.startsWith('"') && val.endsWith('"')) {
    return val.slice(1, -1).replace(/\\"/g, '"');
  }
  if (val.startsWith("'") && val.endsWith("'")) {
    return val.slice(1, -1).replace(/\\'/g, "'");
  }
  if (val === "true") return true;
  if (val === "false") return false;
  if (!isNaN(Number(val)) && val !== "") return Number(val);
  return val;
}

export function parseLandingMarkdown(raw: string): LandingData {
  const frontmatterMatch = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  const markdownBody = frontmatterMatch ? frontmatterMatch[2].trim() : "";
  const yamlContent = frontmatterMatch ? frontmatterMatch[1] : raw;

  // Fallback defaults in case of empty parsing
  const defaultData: LandingData = {
    title: "ZIRA Invest | Plateforme d'Equity Crowdfunding en RDC Kinshasa",
    hero: {
      badge: "Plateforme d'Equity Crowdfunding en RDC Kinshasa",
      badgeIcon: "Sparkles",
      headline: "Investissez dans les pépites congolaises, bâtissez l'avenir de la RDC",
      subheadline: "ZIRA Invest connecte les entrepreneurs congolais à fort potentiel avec les investisseurs locaux et de la diaspora pour financer l'économie réelle à Kinshasa et en RDC en toute transparence et sécurité.",
      ctaPrimaryText: "Découvrir les opportunités",
      ctaPrimaryUrl: "/investisseur/explorer",
      ctaSecondaryText: "Lever des fonds",
      ctaSecondaryUrl: "/porteur/projets/nouveau",
      ctaChooseText: "Choisir un espace",
      ctaChooseUrl: "/choisir",
      heroImage: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=1200&q=80",
      trustBadge: "Sécurisé par séquestre bancaire et régulation OHADA en RDC",
    },
    stats: [
      { label: "Capital Levée", value: "$4.8M+", sub: "Sur plus de 45 projets en RDC" },
      { label: "Taux de Succès", value: "92%", sub: "Campagnes financées" },
      { label: "Investisseurs Actifs", value: "3,200+", sub: "Résidents RDC et Diaspora" },
      { label: "Rendement Moyen Estimé", value: "14.2%", sub: "TRI annuel cible" },
    ],
    features: [
      {
        id: "security",
        badge: "Protection Maximale",
        title: "Séquestre Bancaire et Conformité Rigoureuse",
        description: "Les fonds investis sont conservés sous séquestre bancaire sécurisé en RDC et ne sont débloqués qu'après validation complète des objectifs de la campagne.",
        icon: "ShieldCheck",
      },
      {
        id: "transparency",
        badge: "Transparence Totale",
        title: "Suivi en Temps Réel et Gouvernance",
        description: "Accédez aux rapports financiers trimestriels, aux assemblées générales et aux mises à jour directes des fondateurs depuis votre espace dédié.",
        icon: "TrendingUp",
      },
      {
        id: "ecosystem",
        badge: "Impact Direct",
        title: "Pôles Stratégiques à Fort Potentiel en RDC",
        description: "Soutenez des secteurs clés pour l'autonomie et le dynamisme de la RDC : AgriTech, FinTech, GreenTech, Santé et Logistique.",
        icon: "Zap",
      },
    ],
    sectors: [
      {
        id: "agritech",
        name: "AgriTech",
        title: "AgriTech et Souveraineté Alimentaire",
        desc: "Irrigation solaire, mécanisation partagée et valorisation locale des cultures maraîchères et vivrières à Kinshasa et dans les provinces.",
        projectsCount: 18,
        color: "emerald",
        image: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=1000&q=80",
      },
      {
        id: "fintech",
        name: "FinTech",
        title: "FinTech et Mobile Money RDC",
        desc: "Inclusion financière, passerelles de paiement M-Pesa, Orange Money, Airtel Money et services bancaires modernes en RDC.",
        projectsCount: 14,
        color: "teal",
        image: "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1000&q=80",
      },
      {
        id: "greentech",
        name: "GreenTech",
        title: "GreenTech et Énergie Propre",
        desc: "Mini-réseaux solaires off-grid, valorisation des déchets et solutions énergétiques durables pour Kinshasa et le grand Congo.",
        projectsCount: 13,
        color: "amber",
        image: "https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=1000&q=80",
      },
    ],
    howItWorks: {
      title: "Comment fonctionne ZIRA Invest en RDC ?",
      subtitle: "Un processus fluide et transparent pour les investisseurs comme pour les entrepreneurs congolais.",
      steps: [
        {
          step: "01",
          title: "Sélection et Audit Rigoureux",
          desc: "Notre équipe conformité et risques examine les données financières, juridiques et techniques de chaque entreprise candidate enregistrée au RCCM en RDC.",
        },
        {
          step: "02",
          title: "Campagne et Levée de Fonds",
          desc: "Le projet ouvre sa campagne d'equity crowdfunding. Les investisseurs souscrivent à partir de 50 $ ou équivalent CDF via Mobile Money ou Carte.",
        },
        {
          step: "03",
          title: "Séquestre et Déblocage par Jalons",
          desc: "Les fonds sont sécurisés en banque partenaire. Si l'objectif minimum est atteint, ils sont transférés à l'entreprise pour exécuter son plan de croissance.",
        },
        {
          step: "04",
          title: "Rapports et Dividendes",
          desc: "Les actionnaires reçoivent des dividendes annuels, suivent les métriques en direct et participent aux décisions stratégiques.",
        },
      ],
    },
    guarantees: {
      badge: "Garanties et Confiance",
      title: "Une sécurité de niveau institutionnel en RDC",
      subtitle: "La plateforme applique les plus hauts standards de gouvernance conformes au droit OHADA en RDC pour protéger toutes les parties prenantes.",
      items: [
        {
          title: "KYC et Conformité Rigoureuse",
          desc: "Vérification automatisée de l'identité, détection des risques et conformité stricte aux standards OHADA, BCC et AML en RDC.",
          icon: "ShieldCheck",
        },
        {
          title: "Séquestre Bancaire Garanti",
          desc: "Vos capitaux restent bloqués sur un compte tiers de confiance auprès d'une banque partenaire en RDC jusqu'à la réussite certifiée de la campagne.",
          icon: "CheckCircle2",
        },
        {
          title: "Contrats d'Actionnariat Juridiquement Valides",
          desc: "Émission de pactes d'actionnaires et de certificats d'actions conformes au droit OHADA applicable en République Démocratique du Congo.",
          icon: "BookOpen",
        },
        {
          title: "Support Dédié à Kinshasa",
          desc: "Nos conseillers accompagnent les porteurs de projets et investisseurs en français, lingala et anglais 7j/7.",
          icon: "Zap",
        },
      ],
    },
    faqs: [
      {
        q: "Qu'est-ce que ZIRA Invest ?",
        a: "ZIRA Invest est la première plateforme d'equity crowdfunding dédiée à la République Démocratique du Congo (RDC), qui met en relation des entrepreneurs congolais à fort potentiel avec des investisseurs locaux et de la diaspora pour financer des entreprises réelles en capital.",
      },
      {
        q: "Comment fonctionne l'investissement en capital (equity) ?",
        a: "En investissant dans une entreprise sur ZIRA Invest, vous recevez des parts d'actionnariat certifiées et participez à la croissance de l'entreprise ainsi qu'au versement des dividendes futurs.",
      },
      {
        q: "Comment sont sélectionnés les projets ?",
        a: "Chaque projet est rigoureusement audité par notre équipe à Kinshasa (vérification juridique RCCM/Id.Nat, solvabilité, équipe fondatrice et solidité du business plan).",
      },
      {
        q: "Quels sont les moyens de paiement supportés en RDC ?",
        a: "Nous acceptons les Mobile Money locaux (M-Pesa Vodacom, Orange Money RDC, Airtel Money RDC) ainsi que les cartes bancaires (Visa, Mastercard) et virements bancaires (Rawbank, EquityBCDC, Afriland First Bank CD).",
      },
      {
        q: "Quel est le montant minimum pour investir ?",
        a: "Le ticket d'entrée commence dès 50 $ (ou l'équivalent en Franc Congolais CDF) selon les campagnes, rendant l'investissement accessible à tous.",
      },
    ],
    footer: {
      brand: "ZIRA Invest",
      tagline: "La plateforme de référence pour l'equity crowdfunding et l'investissement à fort impact en RDC Kinshasa.",
      locations: "Kinshasa, République Démocratique du Congo (Gombe, Kinshasa)",
      links: {
        ecosystem: {
          title: "Écosystème",
          items: [
            { label: "Explorer les Projets", url: "/investisseur/explorer" },
            { label: "Déposer un Projet", url: "/porteur/projets/nouveau" },
            { label: "Blog et Actualités", url: "/blog" },
            { label: "Choisir un Espace", url: "/choisir" },
          ],
        },
        portals: {
          title: "Portails",
          items: [
            { label: "Portail Porteur de projet", url: "/porteur/dashboard" },
            { label: "Portail Investisseur", url: "/investisseur/dashboard" },
            { label: "Portail Modérateur et Admin", url: "/moderateur/dashboard" },
          ],
        },
        legal: {
          title: "Contact et Légal",
          items: [
            { label: "Support et FAQ", url: "/faq" },
            { label: "Conditions Générales", url: "/contact" },
            { label: "Politique de Confidentialité", url: "/contact" },
          ],
        },
      },
    },
    markdownContent: markdownBody,
  };

  return defaultData;
}

export const landingContent: LandingData = parseLandingMarkdown(rawLandingMd);
