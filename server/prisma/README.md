# Base de Données FitMe - Architecture Prisma

Cette documentation décrit l'architecture de la base de données pour l'application FitMe, organisée selon les principes DDD (Domain-Driven Design) et Clean Architecture.

## 📁 Structure des Fichiers

```
prisma/
├── base/                    # Configuration de base
│   ├── generator.prisma     # Configuration du générateur Prisma
│   └── datasource.prisma    # Configuration de la source de données
├── models/                  # Modèles de données organisés par domaine
│   ├── user.prisma         # Modèle utilisateur principal
│   ├── user-settings.prisma # Paramètres et configurations utilisateur
│   ├── cycle.prisma        # Modèles liés aux cycles menstruels
│   ├── exercise.prisma     # Modèles exercices et programmes
│   ├── tracking.prisma     # Modèles de suivi (humeur, symptômes)
│   └── system.prisma       # Modèles système (notifications, logs, auth)
├── enums/                   # Énumérations organisées par domaine
│   ├── user-enums.prisma   # Énumérations utilisateur
│   ├── cycle-enums.prisma  # Énumérations cycles
│   ├── exercise-enums.prisma # Énumérations exercices
│   ├── tracking-enums.prisma # Énumérations tracking
│   └── system-enums.prisma # Énumérations système
└── schema.prisma           # Schéma final généré automatiquement
```

## 🏗️ Domaines Métier

### 1. **Domaine Utilisateur** (`user.prisma`, `user-settings.prisma`)

#### Modèles principaux :
- **`User`** : Modèle central des utilisatrices avec profil et contexte
- **`UserSettings`** : Préférences personnalisées (unités, notifications)
- **`ReminderSettings`** : Configuration des rappels personnalisés
- **`UserFeatureFlag`** : Gestion des fonctionnalités activées par utilisatrice
- **`UserObjective`** : Objectifs personnels définis
- **`ProfileChangeLog`** : Historique des modifications de profil

#### Énumérations :
- `ProfileType` : FEMALE, MALE, NON_BINARY, OTHER
- `ContextType` : CYCLE, GENERAL, MENOPAUSE, NONE
- `ObjectiveType` : WEIGHT_LOSS, MUSCLE_GAIN, ENDURANCE, etc.
- `SportFrequency` : SEDENTARY, LIGHT, MODERATE, ACTIVE, VERY_ACTIVE
- `UnitPreference` : METRIC, IMPERIAL

### 2. **Domaine Cycle** (`cycle.prisma`)

#### Modèles principaux :
- **`Cycle`** : Cycles menstruels avec données de régularité
- **`CycleProfileConfig`** : Configuration du profil de suivi des cycles
- **`CycleProvider`** : Fournisseurs externes de données (Clue, Flo, etc.)
- **`Phase`** : Phases du cycle (menstruelle, folliculaire, ovulation, lutéale)

#### Énumérations :
- `CyclePhase` : MENSTRUAL, FOLLICULAR, OVULATION, LUTEAL

### 3. **Domaine Exercice & Programmes** (`exercise.prisma`)

#### Modèles principaux :
- **`Exercise`** : Exercices avec métadonnées (durée, intensité, zone musculaire)
- **`Tag`** : Tags pour catégoriser les exercices
- **`ExerciseTag`** : Relation many-to-many exercices-tags
- **`PhaseExercise`** : Exercices recommandés par phase de cycle
- **`Program`** : Programmes d'entraînement personnalisés
- **`ProgramExercise`** : Planification des exercices dans les programmes

#### Énumérations :
- `Intensity` : VERY_LOW, LOW, MODERATE, HIGH, VERY_HIGH
- `MuscleZone` : UPPER_BODY, LOWER_BODY, CORE, FULL_BODY, CARDIO, etc.
- `TagType` : DIFFICULTY, EQUIPMENT, MUSCLE_GROUP, OBJECTIVE, etc.

### 4. **Domaine Tracking** (`tracking.prisma`)

#### Modèles principaux :
- **`MoodTrack`** : Suivi quotidien de l'humeur et du bien-être
- **`SymptomLog`** : Journal des symptômes ressentis

#### Énumérations :
- `MoodType` : VERY_HAPPY, HAPPY, NEUTRAL, SAD, ANXIOUS, etc.
- `EnergyLevel` : VERY_LOW, LOW, MODERATE, HIGH, VERY_HIGH
- `PainLevel` : NONE, LIGHT, MODERATE, SEVERE, VERY_SEVERE
- `StressLevel` : NONE, LOW, MODERATE, HIGH, VERY_HIGH
- `SleepQuality` : VERY_POOR, POOR, FAIR, GOOD, EXCELLENT
- `SymptomType` : CRAMPS, BLOATING, HEADACHE, MOOD_SWINGS, etc.

### 5. **Domaine Système** (`system.prisma`)

#### Modèles principaux :
- **`Notification`** : Système de notifications intelligentes
- **`ExternalSync`** : Synchronisation avec des services externes
- **`JournalEntry`** : Journal personnel libre
- **`AuditLog`** : Logs d'audit pour les modifications de données
- **`Log`** : Logs d'événements système
- **`RefreshToken`** : Gestion des tokens de rafraîchissement
- **`AuthSession`** : Sessions d'authentification actives

#### Énumérations :
- `NotificationType` : CYCLE_REMINDER, EXERCISE_REMINDER, etc.
- `ReminderType` : PERIOD_START, OVULATION, EXERCISE, etc.
- `ExternalSyncStatus` : PENDING, SUCCESS, FAILED, PARTIAL, SKIPPED
- `ExternalProvider` : APPLE_HEALTH, GOOGLE_FIT, FITBIT, CLUE, FLO, etc.
- `JournalCategory` : GENERAL, CYCLE, EXERCISE, MOOD, etc.
- `EventType` : USER_LOGIN, CYCLE_LOG, EXERCISE_COMPLETE, etc.

## 🔗 Relations Clés

### Relations centrées sur User :
- **1:1** avec `UserSettings`, `CycleProfileConfig`
- **1:N** avec `Cycle`, `Program`, `MoodTrack`, `SymptomLog`, `Notification`, etc.

### Relations de cycle :
- `Cycle` **N:1** avec `User` et `CycleProvider`
- `Cycle` **1:N** avec `Phase`

### Relations d'exercice :
- `Exercise` **N:N** avec `Tag` via `ExerciseTag`
- `Program` **N:N** avec `Exercise` via `ProgramExercise`

## 🚀 Utilisation

### Génération du schéma :
```bash
npm run prisma:build    # Construit le schéma depuis les fichiers sources
npm run prisma:generate # Génère le client Prisma
npm run prisma:push     # Synchronise avec la base de données
```

### Import dans le code :
```typescript
import { PrismaClient } from '../../generated/prisma';
```

## 🎯 Avantages de cette Architecture

1. **Modularité** : Chaque domaine métier est isolé dans ses propres fichiers
2. **Évolutivité** : Facile d'ajouter de nouveaux modèles sans impacter les autres
3. **Lisibilité** : Structure claire et documentée
4. **Maintenabilité** : Séparation des responsabilités respectée
5. **Réutilisabilité** : Énumérations partagées entre domaines 