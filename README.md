# ProjetJeeMaster2Sir - Frontend

Frontend Angular pour la plateforme de simulation d'entretien virtuel.

## Architecture

```
src/app/
├── core/              # Services globaux, guards, interceptors
├── features/          # Fonctionnalités métier
├── shared/            # Composants et modèles partagés
├── layouts/           # Layouts de l'app
└── prompts/           # Prompts IA
```

## Développement

```bash
npm install
ng serve
# http://localhost:4200
```

## Build

```bash
ng build
```

## Branches

- `main` - Production
- `develop` - Intégration
- `feature/ai` - Module IA (Membre 2)
- `feature/frontend-ui` - Interface (Membre 1)
- `feature/avatar` - Avatar/Voice (Membre 3)
- `feature/fraud` - Anti-Cheat (Membre 4)
