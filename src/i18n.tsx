"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";

export type Lang = "en" | "fr";

const en = {
  banner: {
    line: "An open-source civic project. Not affiliated with the Government of Canada or the City of Toronto.",
    badge: "Open source",
  },
  nav: { ranking: "Ranking", map: "Map", methodology: "Methodology", developers: "Developers", data: "Data", back: "All projects" },
  hero: {
    kicker: "Open Nshipyard Canada · Landlord Operator Index",
    title: "Which management companies run Toronto's worst-rated rental buildings?",
    sub: "Toronto's RentSafeTO program, a bylaw enforcement program that scores rental buildings with 3 or more storeys or 10 or more units on maintenance standards, publishes an evaluation score from 0 to 100% for 3,593 registered buildings. We joined those scores to the City's open registration file, which names each building's property management company, and ranked 831 operators by their red-rated buildings, average scores, and the share of their portfolios rated red or yellow.",
    cta1: "See the ranking",
    cta2: "Read the methodology",
  },
  stats: [
    { value: "3,593", label: "rental buildings with a published RentSafeTO evaluation score (evaluations refreshed 2026-10-08; registrations refreshed 2026-07-05)" },
    { value: "831", label: "property management companies ranked, after normalizing 953 raw name spellings into canonical operators" },
    { value: "34", label: "red-rated buildings (score below 70%), 0.9% of the evaluated stock, plus 557 yellow-rated (15.5%)" },
    { value: "473", label: "buildings whose registration names no management company; kept in a separate bucket, counted, never ranked as a company" },
  ],
  caveats: {
    title: "What this does not show.",
    items: [
      "Management, not ownership. The open file names the property management company, not the legal owner. A company that manages a building is not necessarily the company that owns it.",
      "A snapshot, not a live feed. Buildings are evaluated at least once every three years, so many scores are years old. Evaluation vintage: 2026-10-08. Registration vintage: 2026-07-05.",
      "Red buildings are rare. Only 34 of 3,593 buildings score red, so most companies have at most one. The average score and the red-or-yellow share are the more informative columns for large portfolios.",
      "Small portfolios swing. A company with 2 buildings and one red one shows a 50% red share. Sort by building count to see which portfolios are large enough to judge.",
    ],
  },
  ranking: {
    kicker: "The ranking",
    title: "Every management company, ranked.",
    sub: "Sorted by red-rated buildings, then by the share of the portfolio rated red or yellow. Click a company to see every building it manages, each with its score and door-sign colour.",
    search: "Search a company name…",
    showing: "Showing",
    of: "of",
    companies: "companies",
    noResult: "No companies match.",
    sortLabel: "Sort by",
    sorts: [
      { id: "red", label: "Most red buildings" },
      { id: "share", label: "Largest red-or-yellow share" },
      { id: "score", label: "Worst average score" },
      { id: "buildings", label: "Most buildings" },
    ],
    cols: {
      rank: "#", company: "Management company", buildings: "Buildings",
      red: "Red", yellow: "Yellow", avg: "Avg score", units: "Units",
      share: "Red or yellow",
    },
    unattributedNote: "473 buildings name no management company in the registration file. They are counted in the methodology and excluded from the company ranking.",
  },
  drill: {
    title: "Portfolio",
    back: "Back to ranking",
    buildings: "buildings",
    units: "units",
    avgScore: "average score",
    cityAvg: "city average",
    redYellow: "red or yellow",
    cols: { address: "Address", ward: "Ward", units: "Units", evaluated: "Evaluated", score: "Score", sign: "Door sign" },
    green: "Green", yellow: "Yellow", red: "Red",
  },
  map: {
    kicker: "The map",
    title: "Where the ratings land.",
    sub: "Every evaluated building in Toronto, coloured by its RentSafeTO door sign. Red clusters mark where the lowest-scoring buildings sit.",
    green: "Green (85-100)", yellow: "Yellow (70-84)", red: "Red (below 70)",
    operator: "Operator",
    buildings: "buildings plotted",
  },
  methodology: {
    kicker: "Methodology",
    title: "How the index was built, and where it is weak.",
    items: [
      "Sources: the City of Toronto's Apartment Building Evaluation dataset (6,902 evaluation rows, refreshed 2026-10-08) and the Apartment Building Registration dataset (3,611 buildings, refreshed 2026-07-05), both from the Toronto Open Data portal under the Open Government Licence - Toronto, retrieved 2026-10-09.",
      "Deduplication: buildings are evaluated at least once every three years, so the 6,902 rows collapse to 3,593 unique buildings by keeping the latest evaluation per building registration number (RSN), ordered by evaluation completion date.",
      "Join: evaluations were joined to registrations on RSN. 3,591 of 3,593 buildings matched; the 2 unmatched buildings are counted in the buildings file with no operator.",
      "Operator normalization: the registration file spells 953 raw management-company variants. Names were uppercased, legal-entity suffixes (Inc, Ltd, Corp, and 11 more) stripped, then exact-matched; a fuzzy pass (difflib ratio 0.93 or higher with the same first token, union-find) merged 17 more clusters. The full raw-to-canonical mapping is published as operator_name_map.csv, so every merge is auditable.",
      "The hard rule: the file identifies the property management company, never the legal owner. The ranking says 'management company' everywhere and the caveats say what that excludes.",
      "Blank names: 473 buildings (13.2%) have no management company named in the registration file. They are kept in the dataset as an 'unattributed' bucket, counted in the summary, shown on this page, and excluded from the company ranking. They were not silently dropped.",
      "Door-sign bands follow the City's colour-coded rating system (in use since July 2026): green 85-100%, yellow 70-84%, red 0-69%. A conditional pass or a corrected infraction still counts under the published score; the score is the City's, not ours.",
      "Snapshot discipline: evaluation scores refresh on a multi-year cycle, so this page is a dated snapshot (evaluation vintage 2026-10-08), not a live feed of current building conditions.",
    ],
  },
  downloads: {
    kicker: "Data",
    title: "Take the files.",
    body: "The operator ranking, the per-building index, the name-normalization mapping, and the build summary, MIT licensed.",
    files: [
      { name: "operators.csv", desc: "831 ranked operators: red/yellow/green counts, average score, units, portfolio shares" },
      { name: "buildings.csv", desc: "3,593 buildings: score, door sign, operator id and name, address, ward, units" },
      { name: "operator_name_map.csv", desc: "953 raw management-company spellings mapped to 831 canonical operators" },
      { name: "summary.json", desc: "Vintages, join counts, merge counts, and the notes above" },
    ],
    download: "Download",
  },
  developers: {
    kicker: "For developers",
    title: "Query it from code, or from an agent.",
    body: "Three consumption paths, same canonical data. REST for applications, OpenAPI for integration, MCP tools over streamable HTTP for AI agents.",
    endpoints: "Endpoints",
    tryIt: "Try it",
    openapi: "OpenAPI spec",
    mcpTitle: "MCP server",
    mcpBody: "One streamable-HTTP endpoint. Tools: operator_ranking, building_lookup, methodology.",
  },
  mcp: {
    kicker: "Connect your agent",
    title: "Put this data to work inside your AI tools.",
    body: "Pick your harness, copy the prompt, send it to your agent. Your agent runs the setup itself.",
    tabs: { chatgpt: "ChatGPT", claude: "Claude", claudecode: "Claude Code", cli: "CLI", other: "Other" },
    cardTitle: "Copy and send this to {tab}",
    copy: "Copy",
    copied: "Copied",
    chatgptNote: "ChatGPT connects through the documented REST API rather than MCP directly.",
    pChatgpt:
      "I want to use the {displayName} through its API.\n- OpenAPI spec: {origin}/api/openapi.json\n- REST base: {origin}/api/v1\nFirst tell me in two sentences what this API offers, then {exampleLower}, and show me the result.",
    pClaude:
      "In Claude (claude.ai), open Settings, then Connectors, and add a custom connector:\n- Name: {displayName}\n- URL: {origin}/mcp\nThen list the available tools, {exampleLower}, and show me the result.",
    pClaudeCode:
      "Set up the {displayName} MCP server so I can query it from here.\n1. Run: claude mcp add --transport http {slug} {origin}/mcp\n2. Run `claude mcp list` to confirm it connected.\n3. {example}, and show me the result.",
    pCli:
      "# MCP endpoint (streamable HTTP)\n{origin}/mcp\n\n# List the available tools\ncurl -s -X POST {origin}/mcp -H 'Content-Type: application/json' \\\n  -d '{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"tools/list\"}'",
    otherTitle: "Everything else",
    otherBody: "Any harness that speaks MCP over streamable HTTP, or plain REST.",
    mcpEndpoint: "MCP endpoint",
    openapiSpec: "OpenAPI spec",
    restBase: "REST base",
  },
  footer: {
    line: "An open-source civic project. Not affiliated with the Government of Canada or the City of Toronto.",
    sources: "Scores: City of Toronto Apartment Building Evaluation (Toronto Open Data). Operators: City of Toronto Apartment Building Registration (Toronto Open Data). Door-sign bands: RentSafeTO colour-coded rating system (July 2026).",
  },
};

export type Dict = typeof en;

const fr: Dict = {
  banner: {
    line: "Un projet civique à code source ouvert. Sans affiliation avec le gouvernement du Canada ni la Ville de Toronto.",
    badge: "Code source ouvert",
  },
  nav: { ranking: "Classement", map: "Carte", methodology: "Méthodologie", developers: "Développeurs", data: "Données", back: "Tous les projets" },
  hero: {
    kicker: "Open Nshipyard Canada · Indice des exploitants immobiliers",
    title: "Quelles sociétés de gestion exploitent les immeubles locatifs les moins bien notés de Toronto?",
    sub: "Le programme RentSafeTO de Toronto, un programme d'application des règlements qui note les immeubles locatifs de 3 étages ou plus ou de 10 logements ou plus sur les normes d'entretien, publie une note d'évaluation de 0 à 100 % pour 3 593 immeubles enregistrés. Nous avons joint ces notes au fichier d'enregistrement ouvert de la Ville, qui nomme la société de gestion de chaque immeuble, et classé 831 exploitants selon leurs immeubles notés rouge, leurs notes moyennes et la part de leur portefeuille notée rouge ou jaune.",
    cta1: "Voir le classement",
    cta2: "Lire la méthodologie",
  },
  stats: [
    { value: "3 593", label: "immeubles locatifs avec une note d'évaluation RentSafeTO publiée (évaluations actualisées le 2026-10-08; enregistrements le 2026-07-05)" },
    { value: "831", label: "sociétés de gestion classées, après normalisation de 953 graphies brutes en exploitants canoniques" },
    { value: "34", label: "immeubles notés rouge (note sous 70 %), 0,9 % du parc évalué, plus 557 notés jaune (15,5 %)" },
    { value: "473", label: "immeubles dont l'enregistrement ne nomme aucune société de gestion; conservés dans un groupe séparé, comptés, jamais classés comme société" },
  ],
  caveats: {
    title: "Ce que cela ne montre pas.",
    items: [
      "La gestion, pas la propriété. Le fichier ouvert nomme la société de gestion immobilière, pas le propriétaire légal. Une société qui gère un immeuble n'est pas nécessairement celle qui le possède.",
      "Un instantané, pas un flux en direct. Les immeubles sont évalués au moins une fois tous les trois ans, donc beaucoup de notes datent de plusieurs années. Millésime des évaluations : 2026-10-08. Millésime des enregistrements : 2026-07-05.",
      "Les immeubles rouges sont rares. Seuls 34 immeubles sur 3 593 sont notés rouge, donc la plupart des sociétés en ont au plus un. La note moyenne et la part rouge ou jaune sont les colonnes les plus parlantes pour les grands portefeuilles.",
      "Les petits portefeuilles varient fort. Une société de 2 immeubles dont un rouge affiche 50 % de rouge. Triez par nombre d'immeubles pour voir quels portefeuilles sont assez grands pour juger.",
    ],
  },
  ranking: {
    kicker: "Le classement",
    title: "Chaque société de gestion, classée.",
    sub: "Trié par immeubles notés rouge, puis par la part du portefeuille notée rouge ou jaune. Cliquez sur une société pour voir chaque immeuble qu'elle gère, avec sa note et la couleur de son affiche.",
    search: "Rechercher une société…",
    showing: "Affichage de",
    of: "sur",
    companies: "sociétés",
    noResult: "Aucune société ne correspond.",
    sortLabel: "Trier par",
    sorts: [
      { id: "red", label: "Plus grand nombre de rouges" },
      { id: "share", label: "Plus grande part rouge ou jaune" },
      { id: "score", label: "Pire note moyenne" },
      { id: "buildings", label: "Plus grand nombre d'immeubles" },
    ],
    cols: {
      rank: "#", company: "Société de gestion", buildings: "Immeubles",
      red: "Rouge", yellow: "Jaune", avg: "Note moy.", units: "Logements",
      share: "Rouge ou jaune",
    },
    unattributedNote: "473 immeubles ne nomment aucune société de gestion dans le fichier d'enregistrement. Ils sont comptés dans la méthodologie et exclus du classement des sociétés.",
  },
  drill: {
    title: "Portefeuille",
    back: "Retour au classement",
    buildings: "immeubles",
    units: "logements",
    avgScore: "note moyenne",
    cityAvg: "moyenne municipale",
    redYellow: "rouge ou jaune",
    cols: { address: "Adresse", ward: "Quartier", units: "Logements", evaluated: "Évalué le", score: "Note", sign: "Affiche" },
    green: "Vert", yellow: "Jaune", red: "Rouge",
  },
  map: {
    kicker: "La carte",
    title: "Où les notes tombent.",
    sub: "Chaque immeuble évalué de Toronto, colorié selon son affiche RentSafeTO. Les grappes rouges marquent où se trouvent les immeubles les moins bien notés.",
    green: "Vert (85-100)", yellow: "Jaune (70-84)", red: "Rouge (moins de 70)",
    operator: "Exploitant",
    buildings: "immeubles tracés",
  },
  methodology: {
    kicker: "Méthodologie",
    title: "Comment l'indice a été construit, et où il est faible.",
    items: [
      "Sources : le jeu de données Apartment Building Evaluation de la Ville de Toronto (6 902 lignes d'évaluation, actualisé le 2026-10-08) et le jeu Apartment Building Registration (3 611 immeubles, actualisé le 2026-07-05), tous deux du portail de données ouvertes de Toronto sous la Licence du gouvernement ouvert de Toronto, récupérés le 2026-10-09.",
      "Déduplication : les immeubles sont évalués au moins une fois tous les trois ans; les 6 902 lignes se réduisent donc à 3 593 immeubles uniques en conservant la dernière évaluation par numéro d'enregistrement d'immeuble (RSN), ordonnée par date d'achèvement de l'évaluation.",
      "Jointure : les évaluations ont été jointes aux enregistrements sur le RSN. 3 591 immeubles sur 3 593 correspondent; les 2 sans correspondance sont comptés dans le fichier des immeubles sans exploitant.",
      "Normalisation des exploitants : le fichier d'enregistrement épelle 953 variantes brutes de sociétés de gestion. Les noms ont été mis en majuscules, les suffixes d'entités juridiques (Inc, Ltd, Corp et 11 autres) retirés, puis appariés exactement; une passe floue (ratio difflib de 0,93 ou plus avec le même premier mot, union-find) a fusionné 17 grappes de plus. La table complète brute vers canonique est publiée en operator_name_map.csv, donc chaque fusion est vérifiable.",
      "La règle dure : le fichier identifie la société de gestion immobilière, jamais le propriétaire légal. Le classement dit « société de gestion » partout et les mises en garde disent ce que cela exclut.",
      "Noms vides : 473 immeubles (13,2 %) ne nomment aucune société de gestion dans le fichier d'enregistrement. Ils sont conservés dans le jeu de données comme groupe « non attribué », comptés dans le résumé, montrés sur cette page et exclus du classement des sociétés. Ils n'ont pas été écartés en silence.",
      "Les seuils d'affiche suivent le système de notation à code couleur de la Ville (en vigueur depuis juillet 2026) : vert 85-100 %, jaune 70-84 %, rouge 0-69 %. Une réussite conditionnelle ou une infraction corrigée compte toujours sous la note publiée; la note est celle de la Ville, pas la nôtre.",
      "Discipline d'instantané : les notes d'évaluation se renouvellent sur un cycle pluriannuel; cette page est donc un instantané daté (millésime des évaluations 2026-10-08), pas un flux en direct de l'état actuel des immeubles.",
    ],
  },
  downloads: {
    kicker: "Données",
    title: "Prenez les fichiers.",
    body: "Le classement des exploitants, l'indice par immeuble, la table de normalisation des noms et le résumé de construction, sous licence MIT.",
    files: [
      { name: "operators.csv", desc: "831 exploitants classés : comptes rouge/jaune/vert, note moyenne, logements, parts de portefeuille" },
      { name: "buildings.csv", desc: "3 593 immeubles : note, affiche, identifiant et nom d'exploitant, adresse, quartier, logements" },
      { name: "operator_name_map.csv", desc: "953 graphies brutes de sociétés de gestion reliées à 831 exploitants canoniques" },
      { name: "summary.json", desc: "Millésimes, comptes de jointure, comptes de fusions et les notes ci-dessus" },
    ],
    download: "Télécharger",
  },
  developers: {
    kicker: "Pour les développeurs",
    title: "Interrogez-la depuis du code, ou depuis un agent.",
    body: "Trois façons de consommer les mêmes données canoniques. REST pour les applications, OpenAPI pour l'intégration, outils MCP en HTTP continu pour les agents IA.",
    endpoints: "Points de terminaison",
    tryIt: "Essayer",
    openapi: "Spécification OpenAPI",
    mcpTitle: "Serveur MCP",
    mcpBody: "Un point de terminaison HTTP continu. Outils : operator_ranking, building_lookup, methodology.",
  },
  mcp: {
    kicker: "Connectez votre agent",
    title: "Exploitez ces données dans vos outils d'IA.",
    body: "Choisissez votre plateforme, copiez l'invite, envoyez-la à votre agent. Votre agent exécute la configuration lui-même.",
    tabs: { chatgpt: "ChatGPT", claude: "Claude", claudecode: "Claude Code", cli: "CLI", other: "Autre" },
    cardTitle: "Copiez et envoyez ceci à {tab}",
    copy: "Copier",
    copied: "Copié",
    chatgptNote: "ChatGPT se connecte via l'API REST documentée plutôt que directement en MCP.",
    pChatgpt:
      "Je veux utiliser {displayName} via son API.\n- Spécification OpenAPI : {origin}/api/openapi.json\n- Base REST : {origin}/api/v1\nD'abord, dis-moi en deux phrases ce que cette API offre, puis {exampleLower}, et montre-moi le résultat.",
    pClaude:
      "Dans Claude (claude.ai), ouvre les paramètres, puis Connecteurs, et ajoute un connecteur personnalisé :\n- Nom : {displayName}\n- URL : {origin}/mcp\nEnsuite, liste les outils disponibles, {exampleLower}, et montre-moi le résultat.",
    pClaudeCode:
      "Configure le serveur MCP {displayName} pour que je puisse l'interroger d'ici.\n1. Exécute : claude mcp add --transport http {slug} {origin}/mcp\n2. Exécute `claude mcp list` pour confirmer la connexion.\n3. {example}, et montre-moi le résultat.",
    pCli:
      "# Point de terminaison MCP (HTTP continu)\n{origin}/mcp\n\n# Lister les outils disponibles\ncurl -s -X POST {origin}/mcp -H 'Content-Type: application/json' \\\n  -d '{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"tools/list\"}'",
    otherTitle: "Tout le reste",
    otherBody: "Toute plateforme qui parle MCP en HTTP continu, ou REST tout court.",
    mcpEndpoint: "Point de terminaison MCP",
    openapiSpec: "Spécification OpenAPI",
    restBase: "Base REST",
  },
  footer: {
    line: "Un projet civique à code source ouvert. Sans affiliation avec le gouvernement du Canada ni la Ville de Toronto.",
    sources: "Notes : jeu Apartment Building Evaluation de la Ville de Toronto (données ouvertes de Toronto). Exploitants : jeu Apartment Building Registration de la Ville de Toronto (données ouvertes de Toronto). Seuils d'affiche : système de notation à code couleur RentSafeTO (juillet 2026).",
  },
};

const dicts: Record<Lang, Dict> = { en, fr };

const LangCtx = createContext<{ lang: Lang; setLang: (l: Lang) => void; t: Dict }>({
  lang: "en",
  setLang: () => {},
  t: en,
});

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(() => {
    if (typeof window !== "undefined") {
      const q = new URLSearchParams(window.location.search).get("lang");
      if (q === "fr" || q === "en") return q;
    }
    return "en";
  });
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);
  return <LangCtx.Provider value={{ lang, setLang, t: dicts[lang] }}>{children}</LangCtx.Provider>;
}

export function useLang() {
  return useContext(LangCtx);
}
