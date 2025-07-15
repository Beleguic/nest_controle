# BELEGUIC Thibault - 5IW1 - 2025

# 🎬 API Watchlist - N - JS

Système d'authentification complet avec 2FA et gestion de watchlist de films.

## 🚀 Fonctionnalités

### 🔐 Authentification
- **Inscription** avec validation par email
- **Authentification 2FA** avec code envoyé par email
- **Gestion des rôles** (USER, ADMIN)
- **JWT** pour la gestion des sessions
- **Guards** pour protéger les endpoints privés

### 🎬 Watchlist
- **CRUD complet** pour les films
- **Ressources privées** par utilisateur
- **Endpoint admin** pour voir toutes les watchlists
- **Statistiques** personnelles et globales
- **Permissions** : `/movies` retourne toujours les films de l'utilisateur connecté
- **Admin uniquement** : `/movies/admin/all` pour voir tous les films

### 📧 Email
- **MailDev** pour les tests (interface web)
- **Templates** pour validation et 2FA
- **Gestion d'erreurs** d'envoi

### 📚 Documentation
- **Swagger** complet avec exemples
- **Validation** des données avec class-validator
- **Gestion d'erreurs** appropriée

## 🛠️ Technologies

- **Backend** : NestJS, TypeScript
- **Base de données** : PostgreSQL avec Prisma
- **Authentification** : JWT, Passport
- **Email** : Nodemailer + MailDev
- **Validation** : class-validator, class-transformer
- **Documentation** : Swagger/OpenAPI

## 📋 Prérequis

- Node.js (v16+)
- PostgreSQL
- Docker (pour MailDev)

## 🚀 Installation

### 1. Installer les dépendances
```bash
npm install
```

### 2. Configuration de l'environnement
Créer un fichier `.env` à la racine :
```env
# Base de données
DATABASE_URL="postgresql://username:password@localhost:5432/app"

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-in-production"

# PostgreSQL (optionnel, pour Docker)
POSTGRES_USER=postgres
POSTGRES_PASSWORD=password
POSTGRES_DB=app
```

### 3. Démarrer les services
```bash
# Démarrer PostgreSQL, MailDev et Adminer
docker-compose up -d
```

**Services démarrés :**
- **PostgreSQL** : Base de données (port 5432)
- **MailDev** : Interface email (port 1080)
- **Adminer** : Interface base de données (port 8080)

### 4. Configuration de la base de données
```bash
# Générer le client Prisma
npx prisma generate

# Appliquer les migrations
npx prisma migrate dev

# Ou pousser le schéma directement
npx prisma db push
```

### 5. Démarrer l'application
```bash
# Mode développement
npm run start:dev

# Mode production
npm run build
npm run start:prod
```

## 🌐 Accès

- **API** : http://localhost:3000
- **Documentation Swagger** : http://localhost:3000/api
- **Interface MailDev** : http://localhost:1080
- **Adminer (Base de données)** : http://localhost:8080

## 📖 Utilisation

### 🔐 Permissions des endpoints

#### **Endpoints publics (sans authentification)**
- `POST /auth/register` - Inscription
- `GET /auth/verify-email` - Validation email
- `POST /auth/login` - Connexion
- `POST /auth/verify-2fa` - Validation 2FA

#### **Endpoints privés (authentification requise)**
- `GET /auth/profile` - Profil utilisateur
- `POST /auth/refresh` - Rafraîchir token
- `POST /movies` - Créer un film
- `GET /movies` - **Voir ses films uniquement** (peu importe le rôle)
- `GET /movies/:id` - Voir un film spécifique
- `PATCH /movies/:id` - Modifier un film
- `DELETE /movies/:id` - Supprimer un film
- `GET /movies/stats` - Statistiques

#### **Endpoints admin uniquement**
- `GET /movies/admin/all` - **Voir tous les films de tous les utilisateurs**

### 1. Inscription
```bash
POST /auth/register
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "password123"
}
```

### 2. Validation email
- Vérifier l'email reçu sur MailDev (http://localhost:1080)
- Cliquer sur le lien de validation ou utiliser l'endpoint :
```bash
GET /auth/verify-email?token=YOUR_TOKEN
```

### 3. Connexion
```bash
POST /auth/login
{
  "email": "john@example.com",
  "password": "password123"
}
```

### 4. Validation 2FA
- Récupérer le code 2FA sur MailDev
- Valider avec :
```bash
POST /auth/verify-2fa
{
  "code": "123456",
  "userId": 1
}
```

### 5. Utilisation de l'API
```bash
# Ajouter un film (avec token JWT)
POST /movies
Authorization: Bearer YOUR_JWT_TOKEN
{
  "title": "Inception",
  "description": "Un thriller de science-fiction",
  "year": 2010
}

# Voir ses films (peu importe le rôle)
GET /movies
Authorization: Bearer YOUR_JWT_TOKEN

# Voir tous les films (admin seulement)
GET /movies/admin/all
Authorization: Bearer YOUR_JWT_TOKEN
```

## 🔧 Structure du projet

```
src/
├── auth/                    # Module d'authentification
│   ├── dto/                # DTOs pour validation
│   ├── auth.controller.ts  # Contrôleur auth
│   ├── auth.service.ts     # Service auth
│   ├── email.service.ts    # Service email
│   ├── jwt.strategy.ts     # Stratégie JWT
│   ├── jwt-auth.guard.ts   # Guard JWT
│   ├── roles.guard.ts      # Guard rôles
│   └── roles.decorator.ts  # Décorateur rôles
├── movies/                 # Module watchlist
│   ├── dto/                # DTOs films
│   ├── movies.controller.ts
│   └── movies.service.ts
├── prisma.service.ts       # Service Prisma
└── main.ts                 # Point d'entrée
```

## 🗄️ Modèles de données

### User
```prisma
model User {
  id              Int       @id @default(autoincrement())
  email           String    @unique
  password        String
  username        String    @unique
  role            Role      @default(USER)
  isEmailVerified Boolean   @default(false)
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  movies          Movie[]
  emailVerifications EmailVerification[]
  twoFactorCodes  TwoFactorCode[]
}
```

### Movie
```prisma
model Movie {
  id          Int      @id @default(autoincrement())
  title       String
  description String?
  year        Int?
  userId      Int
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

## 🔐 Sécurité

- **Mots de passe** hashés avec bcrypt
- **JWT** pour l'authentification
- **Validation** des données avec class-validator
- **Guards** pour protéger les endpoints
- **Rôles** pour les permissions
- **2FA** par email pour la sécurité

## 📝 Scripts disponibles

```bash
# Développement
npm run start:dev      # Démarrer en mode watch
npm run start:debug    # Démarrer en mode debug

# Production
npm run build          # Compiler
npm run start:prod     # Démarrer en production

# Base de données
npx prisma generate    # Générer le client Prisma
npx prisma migrate dev # Appliquer les migrations
npx prisma db push     # Pousser le schéma
npx prisma studio      # Interface graphique

# Code
npm run lint           # Linter
npm run format         # Formatter
```