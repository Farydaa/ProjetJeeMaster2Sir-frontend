# 🎯 Guide d'Installation et Configuration - Module IA

## ✅ Étape 1: Installation des Dépendances

```bash
cd ProjetJeeMaster2Sir-frontend-main
npm install
```

**Packages installés:**
- `@google/generative-ai` - Gemini API client
- `dotenv` - Gestion des variables d'environnement
- Tous les packages Angular 17+

---

## 🔐 Étape 2: Configuration de l'API Gemini

### 2.1 Obtenir une clé API

1. Allez sur: **https://ai.google.dev/**
2. Cliquez sur **"Get API Key"**
3. Sélectionnez votre projet Google Cloud
4. Créez une nouvelle clé API pour "Google AI"
5. **Copiez la clé** (format: `AIzaXxxx...`)

### 2.2 Créer le fichier de configuration

**Créez le fichier `src/environments/config.ts`:**

```typescript
// src/environments/config.ts
// ⚠️ NE PAS COMMITER CE FICHIER - il contient votre clé API
export const CONFIG = {
  GEMINI_API_KEY: 'VOTRE_CLE_API_ICI',
  BACKEND_URL: 'http://localhost:8080/api',
  ENVIRONMENT: 'development'
};
```

**Exemple complet:**
```typescript
export const CONFIG = {
  GEMINI_API_KEY: 'AIzaSyAb8RN6LZw3YoCRKHZyntqVxJf1Nb_4aIev39pgSeBmCs5UxFLQ',
  BACKEND_URL: 'http://localhost:8080/api',
  ENVIRONMENT: 'development'
};
```

### 2.3 Mettre à jour main.ts

Modifiez `src/main.ts` pour injecter la clé API:

```typescript
import { bootstrapApplication } from '@angular/platform-browser';
import { APP_INITIALIZER, importProvidersFrom } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { AppComponent } from './app/app.component';
import { ConfigService } from './app/core/services/config.service';
import { CONFIG } from './environments/config';

function initializeConfig(configService: ConfigService) {
  return () => {
    // Charger la configuration
    if (CONFIG.GEMINI_API_KEY) {
      configService.set('GEMINI_API_KEY', CONFIG.GEMINI_API_KEY);
      configService.set('BACKEND_URL', CONFIG.BACKEND_URL);
      console.log('✅ Configuration chargée');
    } else {
      console.warn('⚠️ GEMINI_API_KEY non configurée');
    }
    return Promise.resolve();
  };
}

bootstrapApplication(AppComponent, {
  providers: [
    importProvidersFrom(HttpClientModule),
    {
      provide: APP_INITIALIZER,
      useFactory: initializeConfig,
      deps: [ConfigService],
      multi: true
    }
  ]
}).catch(err => console.error(err));
```

---

## 🚀 Étape 3: Lancer l'Application

```bash
npm start
```

L'app démarre sur: **http://localhost:4200**

---

## ✅ Étape 4: Tester le Module IA

### 4.1 Accédez à la page chat

Naviguer vers: **http://localhost:4200/interview/chat-mode**

### 4.2 Remplissez le formulaire

1. **Nom du candidat**: Votre nom
2. **Poste visé**: Ex: "Développeur Senior Angular"
3. **Entreprise**: Ex: "Google"
4. **Description du poste**:
   ```
   Nous cherchons un développeur avec 5+ ans d'expérience en Angular,
   TypeScript, et RxJS. Vous travaillerez sur une architecture modulaire
   et des composants réutilisables.
   ```
5. **Niveau**: Sélectionnez "SENIOR"

### 4.3 Cliquez "Démarrer l'entretien"

✅ **Résultat attendu:**
- 5 questions générées par Gemini
- Questions basées sur votre contexte
- Interface chat interactive

### 4.4 Répondez aux questions

- Écrivez votre réponse dans la textarea
- Cliquez "Suivant →"
- **Résultat attendu:**
  - Score 0-100
  - Justification
  - Points forts & axes d'amélioration

### 4.5 Fin d'entretien

Après la dernière question:
- Score moyen calculé
- Récapitulatif de toutes vos réponses
- Possibilité de recommencer

---

## 🔧 Dépannage

### ❌ "GEMINI_API_KEY not configured"

**Solution:**
1. Vérifiez que `src/environments/config.ts` existe
2. Vérifiez que la clé API est présente
3. Redémarrez l'app (`npm start`)

### ❌ "Failed to initialize Gemini API"

**Solution:**
1. Vérifiez votre connexion internet
2. Testez la clé API sur https://ai.google.dev/
3. Vérifiez que vous avez les quotas disponibles

### ❌ "Network error: 401 Unauthorized"

**Solution:**
- La clé API est probablement invalide ou expirée
- Créez une nouvelle clé sur https://ai.google.dev/

---

## 📁 Structure Créée

```
src/app/
├── core/services/
│   ├── ai.service.ts              ← Service Gemini principal
│   └── config.service.ts          ← Gestion des configs
│
├── features/interview/chat-mode/
│   └── chat-mode.component.ts     ← Interface chat (standalone)
│
├── prompts/
│   ├── question.prompt.ts         ← Template questions
│   ├── evaluation.prompt.ts       ← Template évaluation
│   └── rapport.prompt.ts          ← Template rapports
│
├── shared/models/
│   └── ai.model.ts                ← Interfaces TypeScript
│
└── environments/
    ├── environment.ts             ← Config Angular
    └── config.ts                  ← Config secrets (LOCAL)
```

---

## 📚 Utilisation du Service IA

### Importer le service

```typescript
import { AiService } from '@core/services/ai.service';

constructor(private aiService: AiService) {}
```

### 1️⃣ Générer des questions

```typescript
const context = {
  candidateName: 'John Doe',
  jobTitle: 'Développeur Angular',
  company: 'Google',
  jobDescription: 'Description du poste...',
  level: 'SENIOR',
  mode: 'CHAT',
  questionCount: 5
};

this.aiService.generateQuestions(context).subscribe(
  (questions) => {
    console.log('Questions:', questions);
    // Afficher les questions
  },
  (error) => {
    console.error('Erreur:', error);
  }
);
```

### 2️⃣ Évaluer une réponse

```typescript
this.aiService.evaluateAnswer(
  'Question: Explique le pattern Observable',
  'Réponse du candidat...',
  ['RxJS', 'Observables', 'Reactive Programming']
).subscribe(
  (evaluation) => {
    console.log('Score:', evaluation.score);
    console.log('Feedback:', evaluation.justification);
  }
);
```

### 3️⃣ Générer un rapport

```typescript
this.aiService.generateReport(
  {
    /* toutes les réponses */
  }
).subscribe(
  (report) => {
    console.log('Rapport:', report);
  }
);
```

---

## 🎨 Design System

Tous les composants respectent:

**Couleurs:**
```css
--primary: #2563EB;      /* Boutons principaux */
--secondary: #0F172A;    /* Texte principal */
--accent: #14B8A6;       /* Accents */
--success: #22C55E;      /* Succès */
--warning: #F59E0B;      /* Avertissements */
--danger: #EF4444;       /* Erreurs */
```

**Typographie:**
```css
Police: Poppins ou Inter
Titre (H1): 32px bold
Sous-titre (H2): 24px semi-bold
Corps de texte: 16px regular
Petit texte: 14px regular
```

**Composants:**
```css
Boutons: border-radius 8px
Cartes: border-radius 16px, box-shadow: 0 2px 12px rgba(0,0,0,.08)
Inputs: border 1px solid #E2E8F0, padding 12px
```

---

## 🧪 Tests Manuels - Checklist

- [ ] App démarre sans erreurs
- [ ] Configuration chargée correctement
- [ ] Page chat-mode accessible
- [ ] Formulaire complètement rempli
- [ ] Bouton "Démarrer" génère 5 questions
- [ ] Questions sont personnalisées (mentionnent entreprise/poste)
- [ ] On peut répondre et passer à la question suivante
- [ ] Scores sont affichés (0-100)
- [ ] Score moyen final est calculé
- [ ] Design system respecté (couleurs, spacing, typo)
- [ ] Pas d'erreurs dans la console

---

## 📝 Prochaines Étapes

### Pour vous (Membre 2 - IA):
1. ✅ Commit et push vers `feature/ai`
2. ✅ Créer une Pull Request vers `develop`
3. ✅ Attendre code review
4. ⏳ Merge vers develop une fois approuvé

### Pour les autres membres:
1. **Membre 1 (UI Frontend)**: Implémenter login, register, dashboard
2. **Membre 3 (Avatar+Voix)**: Intégrer avatar 3D et voix
3. **Membre 4 (Fraud)**: Détecter les fraudes

### Intégration finale:
```
feature/frontend-ui  \
feature/avatar        ├→ develop → main
feature/fraud        /
feature/ai          /
```

---

## 🔐 Sécurité Importante

⚠️ **À FAIRE:**
- ✅ Ne pas commiter `src/environments/config.ts` (ajouter à .gitignore)
- ✅ API key doit être dans `.env` en local
- ✅ En production, utiliser des variables d'environnement

⚠️ **À NE PAS FAIRE:**
- ❌ Commiter la clé API directement
- ❌ Partager la clé API en public
- ❌ Hardcoder les secrets dans le code

---

## 📞 Support

Si vous avez des erreurs:

1. **Vérifiez les logs:**
   ```bash
   npm start --verbose
   ```

2. **Consultez la console:**
   - F12 → Console
   - Cherchez les messages `✅` ou `❌`

3. **Testez Gemini directement:**
   - https://makersuite.google.com/app/apikey

---

**Status**: ✅ Module IA complètement implémenté et prêt au test  
**Branche**: `feature/ai`  
**Date**: $(date)  
**Responsable**: Farydaa (Membre 2 - IA)
