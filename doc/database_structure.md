# 🗄️ Structure de la base de données Supabase

## 📋 Vue d'ensemble

Ce projet utilise **Supabase** (PostgreSQL) avec **Row Level Security (RLS)** activé sur toutes les tables.

Il y a deux types de votes possibles :
- **PUBLIC** : on sait qui a voté et quoi
- **ANONYMOUS** : on sait qui a voté (pour bloquer le double vote), mais pas ce qu'il a voté

---

## 📦 Tables

### 1. `public.proposals`
Contient les propositions soumises au vote.

| Colonne | Type | Description |
|--------|------|-------------|
| id | uuid | Clé primaire |
| method | text | Type de vote : `PUBLIC` ou `ANONYMOUS` |
| ... | ... | Autres colonnes de ta proposition |

---

### 2. `public.votes`
Votes **publics** — on sait qui a voté et quel choix il a fait.

| Colonne | Type | Description |
|--------|------|-------------|
| id | uuid | Clé primaire |
| proposal_id | uuid | Référence vers `proposals.id` |
| user_id | uuid | Référence vers `auth.users.id` |
| choice | text | `YES`, `NO` ou `ABSTAIN` |
| voted_at | timestamptz | Date et heure du vote |

**Contraintes :**
- `UNIQUE(user_id, proposal_id)` — un utilisateur ne peut voter qu'une seule fois par proposition

**Utilisée quand :** `proposals.method = 'PUBLIC'`

---

### 3. `public.anonymous_votes`
Votes **anonymes** — on enregistre le choix sans savoir qui a voté.

| Colonne | Type | Description |
|--------|------|-------------|
| id | uuid | Clé primaire |
| proposal_id | uuid | Référence vers `proposals.id` |
| choice | text | `YES`, `NO` ou `ABSTAIN` |
| voted_at | timestamptz | Date et heure du vote |

> ⚠️ Pas de `user_id` ici — c'est volontaire pour garantir l'anonymat.

**Utilisée quand :** `proposals.method = 'ANONYMOUS'`

---

### 4. `public.vote_receipts`
Reçus de vote pour les votes **anonymes** — on sait qu'un utilisateur a voté, mais pas quoi.

| Colonne | Type | Description |
|--------|------|-------------|
| id | uuid | Clé primaire |
| proposal_id | uuid | Référence vers `proposals.id` |
| user_id | uuid | Référence vers `auth.users.id` |
| voted_at | timestamptz | Date et heure du vote |

**Contraintes :**
- `UNIQUE(user_id, proposal_id)` — empêche le double vote anonyme

**Utilisée quand :** `proposals.method = 'ANONYMOUS'`

---

## 🔐 Row Level Security (RLS) — Policies

### Table `votes`

| Policy | Action | Qui | Condition |
|--------|--------|-----|-----------|
| Anyone can read votes | SELECT | Tous | `true` |
| Users can insert own votes | INSERT | Authentifiés | `auth.uid() = user_id` |

---

### Table `anonymous_votes`

| Policy | Action | Qui | Condition |
|--------|--------|-----|-----------|
| Anyone can read anonymous votes | SELECT | Tous | `true` |
| Authenticated users can insert anonymous votes | INSERT | Authentifiés | `true` |

---

### Table `vote_receipts`

| Policy | Action | Qui | Condition |
|--------|--------|-----|-----------|
| Users can read own receipts | SELECT | Authentifiés | `auth.uid() = user_id` |
| Users can insert own receipts | INSERT | Authentifiés | `auth.uid() = user_id` |

---

## 🔄 Logique de vote selon le type de proposition

```
Utilisateur vote sur une proposition
│
├── method = 'PUBLIC'
│   └── INSERT dans votes
│       (bloqué si UNIQUE user_id + proposal_id déjà présent)
│
└── method = 'ANONYMOUS'
    ├── INSERT dans anonymous_votes  (le choix, sans user_id)
    └── INSERT dans vote_receipts    (le user_id, sans le choix)
        (bloqué si UNIQUE user_id + proposal_id déjà présent)
```

---

## ✅ Checklist de sécurité

- [x] RLS activé sur toutes les tables
- [x] Contrainte UNIQUE sur votes publics `(user_id, proposal_id)`
- [x] Contrainte UNIQUE sur vote_receipts `(user_id, proposal_id)`
- [x] Aucun `user_id` dans `anonymous_votes`
- [x] Un utilisateur ne peut lire que ses propres reçus
