# Prompt Claude Code — App Chiffrage Nathan

## Contexte

Je suis apprenti (alternant) chez Exakis Nelite dans l'équipe CES. Je suis en Bachelor 3 SIN DevOps à l'EPSI Nantes en rythme 1 semaine école / 2 semaines entreprise. J'ai besoin d'une app web pour tracker mon chiffrage quotidien (ce que je fais au boulot), en demi-journées (0.5) ou journées complètes (1).

Le projet Next.js est déjà initialisé. Il faut mettre en place Prisma + SQLite et créer l'app.

---

## Stack technique

- **Next.js** (App Router, déjà initialisé)
- **Prisma** avec **SQLite** (fichier local `dev.db`)
- **Tailwind CSS** (déjà configuré avec Next.js)
- Pas d'auth nécessaire (usage perso en local)

---

## 1. Setup Prisma

```bash
npm install prisma @prisma/client
npx prisma init --datasource-provider sqlite
```

## 2. Schéma Prisma (`prisma/schema.prisma`)

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = "file:./dev.db"
}

model Entry {
  id        Int      @id @default(autoincrement())
  date      DateTime
  client    String   // Ex: "Unhaj", "Beaumanoir", "TI" (travail interne)
  ticket    String?  // Ex: "CS0021003", "5164", null
  comment   String   // Ex: "Formation Azure Az-900", "Correctif Bug Prod"
  time      Float    // 0.5 ou 1.0 (demi-journée ou journée)
  type      String?  // Ex: "Evolution", "Correctif", "Formation", null
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

// Jours de formation EPSI à exclure du calendrier entreprise
model FormationDay {
  id   Int      @id @default(autoincrement())
  date DateTime @unique
  label String  @default("FORMATION") // "FORMATION", "SOUTENANCE", "RENTREE", "FIN DE FORMATION"
}
```

Puis :
```bash
npx prisma db push
```

## 3. Seed des jours de formation (`prisma/seed.ts`)

Créer un script de seed qui insère tous les jours de FORMATION d'après mon calendrier EPSI 2025-2026 (rythme 1s école / 2s entreprise). Voici les jours de formation extraits du calendrier :

```typescript
// Septembre 2025 : 22, 23, 24, 25, 26, 29, 30 sept + compléter pour 8 jours
// Octobre 2025 : 1, 2, 3 oct + 20, 21, 22, 23, 24 oct = 8 jours
// Novembre 2025 : 12, 13, 14 nov = 3 jours  
// Décembre 2025 : 1, 2, 3, 4, 5, 15, 16, 17, 18, 19 déc = 10 jours
// Janvier 2026 : 5, 6, 7, 8, 9 jan = 5 jours
// Février 2026 : 2, 3, 4, 5, 6, 16, 17, 18, 19, 20 fév = 10 jours
// Mars 2026 : 2, 3, 7(FORMATION), 8(FORMATION), 9(FORMATION), 27(FORMATION), 28(FORMATION) = 5 jours (ajuster pour coller à 5)
// Avril 2026 : 7, 8, 9, 10, 27, 28, 29, 30 avr = 8 jours
// Mai 2026 : 18, 19, 20, 21, 22 mai = 5 jours
// Juin 2026 : 8, 9, 10, 11, 12, 15, 16, 17, 18, 19, 29, 30 juin = 12 jours
// Juillet 2026 : 1, 2, 3 juil (FORMATION) = 3 jours
// Juillet 2026 : 7, 8, 9, 10 juil = SOUTENANCE
// Juillet 2026 : 11 juil = FIN DE FORMATION
// Septembre 2026 : 7 sept = SOUTENANCE (1 jour)
// TOTAL = 78 jours de formation
```

Ajouter dans `package.json` :
```json
"prisma": { "seed": "npx tsx prisma/seed.ts" }
```

## 4. Lib Prisma (`lib/prisma.ts`)

Singleton Prisma classique pour Next.js (éviter les connexions multiples en dev).

## 5. Pages & fonctionnalités

### Page principale `/` — Vue calendrier mensuel

- **Calendrier mensuel** avec navigation mois précédent/suivant
- Chaque jour affiche :
  - Les entrées du jour (client + temps) sous forme de badges/pastilles
  - Le total du jour (ex: "1j" ou "0.5j")
  - **Fond coloré** si jour de FORMATION (vert clair, comme sur le planning EPSI)
  - **Fond gris** pour les weekends
  - **Fond rouge clair** si jour entreprise et total < 1 (incomplet)
- **Total du mois** affiché en bas : total jours travaillés, total formation, total combiné
- Cliquer sur un jour ouvre un **drawer/modal** pour ajouter/modifier les entrées

### Modal/Drawer d'ajout d'entrée

- Formulaire avec les champs :
  - **Date** (pré-remplie avec le jour cliqué)
  - **Client** (input avec suggestions basées sur les clients déjà utilisés : Unhaj, Beaumanoir, TI...)
  - **Ticket** (optionnel, texte libre)
  - **Commentaire** (texte libre)
  - **Temps** : sélecteur `0.5` ou `1` (boutons radio ou toggle)
  - **Type** : sélecteur optionnel (Evolution, Correctif, Formation, Support, null)
- Bouton supprimer pour chaque entrée existante
- On peut ajouter **plusieurs entrées par jour** (ex: 0.5 matin sur un ticket + 0.5 après-midi sur un autre)

### Page `/stats` — Statistiques

- **Répartition par client** (camembert ou barres)
- **Répartition par type** (Evolution, Correctif, Formation...)
- **Total jours par mois** (graphique barres)
- **Ratio formation/entreprise** par mois
- Filtres par période (date début / date fin)

### Page `/export` — Export

- Bouton **Export CSV** du mois en cours ou d'une période
- Bouton **Export Excel** (format similaire à mon fichier actuel avec les colonnes : Date, Jour, Client, Ticket, Commentaires, Temps, Type)

## 6. API Routes (App Router)

```
POST   /api/entries          → Créer une entrée
GET    /api/entries?month=X&year=Y  → Lister les entrées du mois
PUT    /api/entries/[id]     → Modifier une entrée
DELETE /api/entries/[id]     → Supprimer une entrée
GET    /api/entries/export?format=csv&from=X&to=Y → Export
GET    /api/formation-days?month=X&year=Y → Jours de formation du mois
GET    /api/stats?from=X&to=Y → Stats agrégées
GET    /api/clients          → Liste des clients distincts (pour autocomplétion)
```

## 7. Import des données existantes

Créer un script `scripts/import-excel.ts` qui lit mon fichier Excel existant (`Chiffrage_Nathan.xlsx`) et importe toutes les entrées dans la BDD. Le fichier a des onglets par mois (Septembre, Octobre, ..., Août) avec les colonnes :
- **Sept → Août** : `Date | Jour | Client | Ticket | Commentaires | Temps | Type`
Type` (colonne Numéro en plus à ignorer)

Attention : certains mois (Février et après) ont les dates en 2025 au lieu de 2026, c'est normal — les mois Février à Août correspondent à 2026.

Le script doit :
1. Lire chaque onglet avec une lib comme `xlsx`
2. Mapper les colonnes correctement selon le format (avec ou sans colonne Numéro)
3. Ne pas importer les lignes vides (sans client ni commentaire)
4. Insérer en bulk dans Prisma

## 8. Style & UX

- Design **propre et minimaliste**, couleurs sobres
- Mode sombre supporté
- Responsive (utilisable sur mobile pour saisir rapidement)
- Les jours de formation doivent être **clairement identifiables visuellement** (vert comme sur le calendrier EPSI)
- Utiliser des composants simples (pas besoin de shadcn, Tailwind suffit)

## 9. Commandes de lancement

```bash
# Setup initial
npm install prisma @prisma/client xlsx
npx prisma db push
npx prisma db seed

# Import des données existantes
npx tsx scripts/import-excel.ts

# Dev
npm run dev
```

---

## Résumé de la structure attendue

```
├── prisma/
│   ├── schema.prisma
│   ├── seed.ts
│   └── dev.db
├── lib/
│   └── prisma.ts
├── scripts/
│   └── import-excel.ts
├── app/
│   ├── page.tsx              (calendrier mensuel)
│   ├── stats/page.tsx        (statistiques)
│   ├── export/page.tsx       (export CSV/Excel)
│   ├── layout.tsx            (navbar avec liens)
│   └── api/
│       ├── entries/
│       │   ├── route.ts      (GET, POST)
│       │   ├── [id]/route.ts (PUT, DELETE)
│       │   └── export/route.ts
│       ├── formation-days/route.ts
│       ├── stats/route.ts
│       └── clients/route.ts
├── components/
│   ├── Calendar.tsx
│   ├── DayCell.tsx
│   ├── EntryModal.tsx
│   ├── MonthNav.tsx
│   └── StatsCharts.tsx
└── Chiffrage_Nathan.xlsx     (fichier source à importer)
```
