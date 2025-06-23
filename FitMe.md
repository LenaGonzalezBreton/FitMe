### _Cycle-Based Fitness Companion_

---

## 👩‍💻 Projet réalisé par :

- **Léna** — UI/UX Design · Frontend · Base de données · Cheffe de projet
    
- **Lazaro** — UI/UX Design · Frontend · DevOps
    
- **Quentin** — Backend Developer
    

---

## 🎯 Objectif du projet :

Créer une application de suivi fitness **adaptée au cycle hormonal et à la ménopause**, intégrant des programmes personnalisés, des notifications intelligentes, une expérience fluide, et des outils communautaires à terme.

---

## 🚀 Période de réalisation :

**16 juin – 1er septembre 2025**  
_(environ 16 jours de travail en présentiel à l’école)_

---

<div style="page-break-after: always;"></div>

# 📚 **Sommaire interactif**

> _Clique sur une section pour y accéder directement dans ton document._

---

### 🔹 Structure du cahier des charges

- [📌 **Introduction**](#introduction)
    
- [🌍 **Contexte**](#contexte)
    
- [⚡ **Description Courte**](#description-courte)
    
- [📝 **Description Détaillée**](#description-détaillée)
    
- [💼 **Description Commerciale**](#description-commerciale)
    
- [🎯 **Audience Cible**](#audience)
    
- [🏁 **Analyse de la Concurrence**](#concurrence)
    

---

### 🔹 Organisation & Technique

- [🛠️ **Description Technique**](#description-technique)
    
- [🗂️ **Gestion de Projet**](#gestion-de-projet)
    
- [👥 **Équipe**](#équipe)
    
- [📋 **Tâches du Projet**](#tâches-du-projet)
    
- [🚀 **Premier Sprint**](#premier-sprint)
    
- [🧱 **Infrastructure & Déploiement**](#infrastructure)
    

---

### 🔹 Conception Produit

- [🖼️ **Maquettage & UI/UX**](#maquettage)
    
- [🧬 **Conception Base de Données**](#conception-bdd)
    
- [📑 **Documentation & Références**](#documentation)

<div style="page-break-after: always;"></div>

#  📌 Introduction <a name="introduction"></a>

___
> **FitMe** est une application mobile innovante de **suivi sportif personnalisé**, pensée spécifiquement pour les femmes. Elle intègre une dimension encore trop souvent négligée dans le domaine du sport : l'influence des **variations hormonales** liées au **cycle menstruel** ou à la **ménopause** sur la performance physique, l'énergie, et la récupération.
> 
> L’objectif de FitMe est de proposer un accompagnement complet et individualisé, en tenant compte de ces fluctuations naturelles pour **optimiser les entraînements et améliorer le bien-être global** de ses utilisatrices. À travers une planification intelligente et des suggestions adaptées à chaque phase du cycle hormonal, l'application permet d’adapter l’intensité, la fréquence et le type d’exercices de manière pertinente et personnalisée.
> 
> En combinant **données personnelles, retours physiologiques et recommandations ciblées**, FitMe devient un véritable **coach digital** au service de la santé féminine.



<div style="page-break-after: always;"></div>

# 🌍 Contexte <a name="contexte"></a>
___
> Dans le cadre du **projet de fin d’année (T-YEP-600)** encadré par l'école informatique Epitech à Nancy, nous avons choisi de concevoir une application portant une **cause forte et engagée** : la prise en compte des variations hormonales dans l’activité physique féminine. FitMe.
> 
> Aujourd’hui, très peu d'applications sportives tiennent réellement compte des changements hormonaux liés au **cycle menstruel** ou à la **ménopause**, alors que de nombreuses recherches scientifiques mettent en évidence leur impact significatif sur les performances physiques, la récupération, la fatigue et même l’humeur.
> 
> C’est dans cette optique que nous développons **FitMe**, une application mobile intelligente, destinée à accompagner les femmes dans leur pratique sportive en leur proposant des programmes adaptés à chaque phase hormonale. À travers un questionnaire personnalisé, une base d'exercices contextualisée et des rappels pertinents, FitMe ambitionne de devenir un **véritable coach numérique personnalisé**.
> 
> Pour mener à bien ce projet, nous avons mis en place une organisation basée sur des **sprints hebdomadaires** et des **points de suivi réguliers**. Ces réunions sont indispensables pour assurer une progression fluide, éviter les blocages et garantir que le projet reste aligné avec les objectifs initiaux, tout en respectant les contraintes de temps et de qualité imposées par le cadre académique. 


<div style="page-break-after: always;"></div>

# ⚡ Description Courte <a name="description-courte"></a>
___
> **FitMe** est une application mobile de **coaching sportif personnalisé** conçue pour accompagner les femmes à chaque étape de leur cycle hormonal, qu’il s’agisse du **cycle menstruel** ou de la **ménopause**.
> 
> Grâce à un questionnaire initial, l'application identifie le profil hormonal de l’utilisatrice et adapte ensuite les entraînements en fonction des **phases du cycle**, en proposant des exercices ciblés, des conseils adaptés, et des rappels au bon moment.
> 
> FitMe vise à offrir une expérience sportive plus **efficace, respectueuse du corps féminin et basée sur des données scientifiques**, afin de permettre à chaque femme d’atteindre ses objectifs de forme tout en respectant son rythme naturel.



<div style="page-break-after: always;"></div>

# 📝 Description Détaillée <a name="description-détaillée"></a>

___
**FitMe** est une application mobile conçue pour offrir une **expérience sportive individualisée**, tenant compte des **fluctuations hormonales** liées au **cycle menstruel** et à la **ménopause**. Elle repose sur une suite cohérente de fonctionnalités interconnectées, pensées pour s’adapter au quotidien et aux objectifs personnels de chaque femme.

---
### 📋 Fonctionnalités principales

#### ✅ 1. **Questionnaire d’entrée personnalisé**

> **Objectif :** établir un **profil hormonal et sportif de départ** afin de personnaliser l’expérience utilisateur dès la première utilisation.

- Questions sur la ménopause, régularité du cycle, date des dernières règles, durée moyenne, symptômes fréquents.
    
- Questions sur les objectifs de forme : perte de poids, tonification, performance, remise en forme, etc.
    
- Résultat : génération automatique d’un **profil utilisateur** (ménopausée ou cyclique) avec **déclenchement de la logique de calcul de phases**.
    
- Ce questionnaire sert également à configurer les **préférences d’entraînement** (fréquence, jours préférés, niveau, etc.).
    

---

#### 📆 2. **Calcul des cycles en base de données**

> **Objectif :** permettre un **suivi précis et évolutif** du cycle de l’utilisatrice pour adapter les entraînements aux fluctuations hormonales.

- À partir de la **date de début de cycle** et de la **durée moyenne saisie**, l’algorithme génère un cycle menstruel estimé.
    
- Chaque cycle est divisé en **phases biologiques** : Menstruelle, Folliculaire, Ovulatoire, Lutéale.
    
- Ces données sont enregistrées dans la BDD via des entités `Cycle` et `Phase`, associées à chaque `User`.
    
- La logique permet une **mise à jour automatique** en cas de modifications manuelles (ex : date de règles modifiée).
    

---

#### 🔄 3. **Gestion automatique des phases**

> **Objectif :** identifier la **phase actuelle** et **prévoir les suivantes** pour fournir des recommandations d’exercices et de rythme.

- À chaque ouverture de l’app, le système détermine **où l’utilisatrice se situe dans son cycle**.
    
- Les phases à venir sont calculées pour les 3 prochaines semaines afin d’alimenter le **calendrier d’entraînement personnalisé**.
    
- En fonction de la phase :
    
    - Intensité des exercices proposée
        
    - Conseils spécifiques (repos, hydratation, récupération)
        
    - Rappels adaptés envoyés via push
        

---

#### 🏋️‍♀️ 4. **Base d’exercices adaptée aux phases hormonales**

> **Objectif :** proposer des exercices cohérents avec la physiologie du moment, en adaptant intensité, type et durée.

- Chaque exercice est **tagué** selon les phases les plus appropriées (par ex. exercices légers durant les règles, HIIT en phase folliculaire).
    
- Informations disponibles :
    
    - Titre
        
    - Description
        
    - Image ou animation
        
    - Phase(s) conseillée(s)
        
    - Durée & intensité
        
- Utilisatrice peut filtrer par :
    
    - Objectif
        
    - Phase
        
    - Zone musculaire
        

---

#### 🧩 5. **Création de programmes personnalisés**

> **Objectif :** permettre à chaque femme de créer un **programme d'entraînement sur-mesure**, aligné sur son cycle et ses objectifs.

- À partir des données du questionnaire et du cycle, l’utilisatrice peut :
    
    - Ajouter des exercices manuellement à un programme
        
    - Suivre des suggestions automatiques selon les jours de phase
        
- Chaque programme est lié au calendrier du cycle pour une **planification optimisée**.
    
- Les programmes sont **éditables, duplicables** et sauvegardés en BDD.
    

---

#### 🔔 6. **Rappels push liés au cycle et aux programmes**

> **Objectif :** maintenir l’engagement de l’utilisatrice avec des **notifications pertinentes** et non-invasives.

- Notifications configurables (via `ReminderSettings`) :
    
    - Rappel d’exercice prévu aujourd’hui
        
    - Transition vers une nouvelle phase
        
    - Messages de motivation ou de bien-être
        
- Intégration avec **Firebase Cloud Messaging** pour une gestion efficace
    

---

### 🎯 Bonus (si temps disponible)

#### 🌡️ Suivi de l’humeur / douleurs

> Permet à l’utilisatrice de **noter quotidiennement son état physique et mental**, afin de mieux comprendre l’impact du cycle sur son bien-être.

- Champs à remplir : humeur, énergie, douleurs, stress, sommeil
    
- Historique consultable dans le profil
    
- Possibilité d’afficher des **corrélations** entre phases et ressenti
    

#### 📈 Suivi des performances et de la progression

> Affiche une **vue synthétique** de l’évolution de l’activité physique dans le temps.

- Statistiques :
    
    - Séances réalisées
        
    - Jours actifs par semaine
        
    - Régularité
        
    - Charge de travail par phase
        
- Permet une **auto-évaluation continue** et encourage la régularité

___ 


<div style="page-break-after: always;"></div>

# 💼 Description Commerciale <a name="description-commerciale"></a>


___ 
> **FitMe** se positionne comme une **application de fitness de nouvelle génération**, conçue pour répondre à un **besoin encore largement ignoré** : l’adaptation de l’activité physique aux **variations hormonales naturelles** du corps féminin.

---

### 🚀 Une proposition de valeur unique

Contrairement aux applications classiques qui proposent des programmes standards et linéaires, FitMe s’appuie sur une **approche scientifique et personnalisée**, centrée sur les **cycles hormonaux (menstruels et ménopausiques)**.

Chaque recommandation, chaque exercice, chaque rappel est synchronisé avec le **rythme biologique réel** de l’utilisatrice.  
C’est une **révolution dans le monde du sport numérique**, où la performance ne se mesure plus uniquement à la sueur mais aussi à l’écoute du corps.

---

### 👩‍⚕️ Un marché en attente

Le marché du fitness est saturé d'applications généralistes — mais très peu d’entre elles :

- ciblent **exclusivement les femmes**
    
- considèrent **les fluctuations hormonales**
    
- combinent **sport, bien-être et santé cyclique** dans une seule expérience fluide
    

FitMe vient **combler ce vide**, en répondant à une attente réelle de **personnalisation**, de **reconnaissance du vécu féminin**, et de **coaching intelligent**.

---

### 🎯 Notre cible

- Femmes entre **18 et 50+ ans**, sportives régulières ou débutantes
    
- Utilisatrices de **trackers de cycle** souhaitant aller plus loin que le simple suivi
    
- Personnes en **période de ménopause ou périménopause** cherchant à reprendre le sport en douceur
    
- Celles qui ont **déjà essayé des apps de sport**, mais s’y sont senties en décalage
    

---

### 📈 Positionnement

| Élément               | FitMe                                                    |
| --------------------- | -------------------------------------------------------- |
| Segmentation          | Femmes uniquement                                        |
| Différenciateur clé   | Adaptation hormonale + personnalisation avancée          |
| Ton & image de marque | Bienveillant, scientifique, moderne                      |
| Monétisation (future) | Freemium avec contenus premium (étude possible post-MVP) |

---

### 💡 En résumé

**FitMe, c’est bien plus qu’un coach sportif.**  
C’est un **allié quotidien** pour les femmes qui veulent prendre soin de leur corps **avec intelligence**, **en phase avec leur nature hormonale**, et **sans culpabilité**.


<div style="page-break-after: always;"></div>

# 🎯 Audience <a name="audiance"></a>

___
**FitMe** s’adresse à une audience féminine variée, mais unie par un même besoin : pratiquer une activité physique qui respecte leur **rythme hormonal naturel** et leur **recherche d’équilibre personnel**.

---

### 👩‍🦰 Cibles principales

|Profil|Description|Besoin identifié|
|---|---|---|
|**Femmes de 20 à 50+ ans**|En période de fertilité, en préménopause ou en ménopause|Besoin d’un accompagnement respectueux des variations hormonales|
|**Sportives occasionnelles ou régulières**|Niveau débutant à intermédiaire|Besoin d’un programme encadré, adapté à leur forme du moment|
|**Utilisatrices d’apps de cycle**|(Flo, Clue, etc.)|Recherchent une **intégration avec leur réalité corporelle** dans le sport|
|**Femmes ménopausées**|Fréquemment ignorées par les apps fitness traditionnelles|Besoin d’une approche douce, progressive, sans jugement|
|**Femmes post-partum** _(optionnel/extension)_|En reprise d’activité|Besoin d’un suivi spécifique, adapté à leurs nouveaux rythmes|

---

### 📱 Habitudes numériques

- Habituées à utiliser des **applications de santé / bien-être**
    
- À l’aise avec les **interfaces mobiles** et les **notifications push**
    
- Réactives à des **conseils personnalisés et bienveillants**
    

---

### 🤝 Ton adapté à l’audience

- 💬 **Langage positif**, rassurant, jamais culpabilisant
    
- 📊 **Personnalisation intelligente** plutôt que coaching militaire
    
- 🎯 Valorisation de la **progression douce** et de l’**écoute du corps**


<div style="page-break-after: always;"></div>

# 🏁 Concurrence  <a name="concurrence"></a>

___
Le secteur du **fitness digital pour femmes** connaît une croissance notable, mais peu d’applications prennent réellement en compte les **cycles hormonaux** de manière intelligente et individualisée.

Voici une analyse des **concurrents partiels ou indirects** de FitMe :

---

### 🔍 Concurrents partiels & analyse

| Application            | Type                        | Points forts                                    | Limites pour notre cible                                      |
| ---------------------- | --------------------------- | ----------------------------------------------- | ------------------------------------------------------------- |
| **Flo**                | Suivi de cycle menstruel    | Interface intuitive, rappels, communauté        | Aucune fonctionnalité sportive intégrée                       |
| **MyFlo**              | Suivi hormonal et symptômes | Recommandations santé selon le cycle            | Pas d’entraînement, focus uniquement bien-être hormonal       |
| **FitrWoman**          | Sport & cycle               | Adaptation sportive au cycle, interface simple  | Peu personnalisable, offre limitée, pas de programme long     |
| **Clue**               | Suivi de cycle avancé       | Analyse fine des symptômes, design épuré        | Aucun lien avec l’activité physique                           |
| **Clementine**         | Coaching hormonal & mental  | Contenu audio/vidéo, focus mental et relaxation | Pas d'exercice physique, pas de programme personnalisé        |
| **Nike Training Club** | Sport généraliste           | Grande base d’exercices, qualité pro            | Aucune prise en compte du cycle ou de la physiologie féminine |
| **Freeletics**         | Sport personnalisé          | Programmes adaptatifs, coaching IA              | Aucune différenciation hormonale ou genrée                    |

---

### 🧠 Positionnement différenciateur de FitMe

> 🎯 **FitMe est la seule application** à combiner :
> 
> - Un **suivi hormonal** dynamique (menstruel & ménopause)
>     
> - Une **base d’exercices contextualisée** par phase biologique
>     
> - Une **création de programme entièrement personnalisée**
>     
> - Des **notifications et conseils adaptés en temps réel**
>     
> - Une **UX pensée pour le quotidien des femmes**, sans complexité inutile
>     

---

### 🥇 Notre avantage compétitif

- Approche **biologique et data-driven**
    
- Complémentarité **suivi + sport**, absente chez tous les concurrents listés
    
- **Positionnement empathique**, ni culpabilisant ni ultra-performance
    
- Design **mobile-first** et système **intelligent d’adaptation aux cycles**


<div style="page-break-after: always;"></div>

# 🛠️ Description Technique <a name="description-technique"></a>

___
> L’architecture technique de **FitMe** a été définie avec soin pour assurer une solution performante, évolutive et facile à maintenir. Voici une présentation détaillée des choix technologiques effectués et les raisons qui les justifient :
> 
> ---
> 
>  **🖥️ Frontend Mobile : React Native + NativeWind**
> 
> Nous avons choisi **React Native** pour la partie mobile car il permet le développement d’applications **cross-platform** (iOS et Android) à partir d’un seul code source. Cela optimise les ressources humaines tout en garantissant des performances proches du natif.
> 
> Afin d’uniformiser l’UI et de gagner du temps dans le stylage, nous avons intégré **NativeWind**, une adaptation de TailwindCSS à React Native. Cet outil permet un design modulaire, responsive et élégant, parfaitement aligné avec notre logique mobile-first.
> 
> ---
> 
> **⚙️ Backend : Nest.js (+ Socket.io en option)**
> 
> **Nest.js** est un framework backend en TypeScript basé sur Express. Il propose une architecture modulaire et bien structurée, ce qui facilite la **collaboration en équipe**, la **scalabilité**, et la **maintenabilité** du projet sur le long terme.
> 
> En cas de besoin de fonctionnalités en **temps réel** (ex. coaching live, alertes de cycle, interactions communautaires), **Socket.io** pourra être intégré sans difficulté grâce au support natif de Nest.js pour les WebSockets.
> 
> ---
> 
>  **🔔 Notifications : Firebase**
> 
> Pour les notifications push, nous avons opté pour **Firebase Cloud Messaging (FCM)**. Il s’agit d’un service éprouvé, facile à intégrer, gratuit dans ses limites d’usage standard, et parfaitement adapté à une version MVP.
> 
> Ce choix garantit des rappels fiables pour les séances de sport, les changements de phase, ou les encouragements personnalisés.
> 
> ---
> 
>  **🗃️ Base de données : PostgreSQL**
> 
> La base de données choisie est **PostgreSQL**, un SGBD relationnel reconnu pour sa fiabilité, son intégrité des données et sa robustesse.
> 
> Elle est parfaitement adaptée à la modélisation des entités complexes de notre projet : utilisateurs, cycles, programmes, suivis d’humeur, exercices, etc.
> 
> De plus, son support natif des champs **JSON** nous permet de stocker des données semi-structurées tout en bénéficiant de la rigueur relationnelle.
> 
> ---
> 
>  **📦 Infrastructure : Docker (Kubernetes en option)**
> 
> Le projet est conteneurisé avec **Docker**, ce qui assure une **cohérence des environnements** entre les développeurs, les phases de test, et les déploiements.
> 
> Cette approche permet aussi une intégration facilitée dans les pipelines CI/CD.
> 
> Si le temps le permet, l’introduction de **Kubernetes** pourrait offrir une orchestration avancée : montée en charge horizontale, gestion fine des services, haute disponibilité.
> 
> ---
> 
>  🧠 Logique fonctionnelle
> 
> Fonctionnellement, l'application :
> 
> - Calcule les phases du cycle à partir des données de l'utilisatrice
>     
> - Stocke et gère les profils et programmes personnalisés
>     
> - Propose des exercices adaptés aux phases hormonales
>     
> - Envoie des suggestions et rappels via notifications
>     
> 
> Tous ces choix sont motivés par un **équilibre entre puissance technique, rapidité de développement, et compétences de l’équipe**.



<div style="page-break-after: always;"></div>

# 🗂️ Gestion de Projet <a name="gestion"></a>
 
___
> Afin d’assurer une organisation efficace du projet et de garantir une progression fluide et structurée, nous avons mis en place un ensemble d’outils et de méthodes adaptés :
> 
> - **Linear** : Utilisé pour la gestion des tickets de sprint. Connecté à notre serveur Discord, il permet la création de tickets directement via un bot ou depuis l’interface web après discussion d’équipe.
>     
> - **Obsidian** : Utilisé pour maintenir une documentation claire, organisée et régulièrement mise à jour du projet.
>     
> - **Discord** : Constitue notre principal outil de communication. En dehors des sessions de travail en présentiel, toutes nos interactions, annonces et coordinations se font sur cette plateforme, avec l’aide de bots si nécessaire.
>     
> - **GitHub** : Sert à l’hébergement du code, au contrôle de version et à la gestion des pipelines CI/CD.
>     
> 
> Nous avons adopté la méthode **Agile Scrum**, avec une organisation en **sprints hebdomadaires** permettant de suivre l’avancement, ajuster les charges de travail et favoriser une dynamique d’équipe continue.  
> Pour le premier sprint, chaque membre de l’équipe s’engage à fournir **5 JH (journées/homme)** de travail effectif.


<div style="page-break-after: always;"></div>

# 👥 Équipe  <a name="équipe"></a>

___
Le projet **FitMe** est porté par une équipe soudée, complémentaire et engagée, composée de trois membres aux compétences réparties entre **design**, **développement**, **base de données** et **gestion de projet**.

---

#### 👩‍💼 **Léna** – UI/UX · Base de Données · Lead Project

- Responsable de l’**expérience utilisateur** (maquettes, parcours, ergonomie)
    
- En charge de la **modélisation de la base de données** et de la gestion des entités relationnelles
    
- Joue le rôle de **cheffe de projet**, assurant le suivi des sprints, la coordination d’équipe et la tenue des objectifs
    

---

#### 🧑‍💻 **Lazaro** – UI/UX · DevOps · Infrastructure

- Participe à la **conception visuelle** de l’application aux côtés de Léna
    
- Gère l’**infrastructure technique**, la mise en place de **Docker**, et les configurations de l’environnement de travail
    
- Responsable des aspects **DevOps**, y compris la documentation technique et le déploiement local/test
    

---

#### 👨‍🔧 **Quentin** – Backend & API

- Développeur principal du **backend** avec **Nest.js**
    
- En charge de la **création des endpoints API**, de la gestion de la logique métier (cycle, phases, programmes), et de la sécurisation des routes
    
- Travaille étroitement avec la base de données pour assurer la cohérence des flux de données
    

---

### 🧠 Une équipe aux forces complémentaires

| Compétence        | Responsable principal |
| ----------------- | --------------------- |
| UI/UX Design      | Léna, Lazaro          |
| Base de Données   | Léna                  |
| Backend/API       | Quentin               |
| DevOps & Docker   | Lazaro                |
| Gestion de Projet | Léna                  |


<div style="page-break-after: always;"></div>

# 📋 Tâches du Projet  <a name="tâches-du-projet"></a>

___
Voici la liste des tâches principales identifiées pour mener à bien le développement de l'application **FitMe**.  
Elles sont classées par **modules fonctionnels**, avec un découpage en sous-tâches pour faciliter l’organisation en sprints.

---

#### 🔐 Authentification & Profil utilisateur

-  Création de compte (email + mot de passe)
    
-  Connexion sécurisée
    
-  Hashage des mots de passe (bcrypt ou similaire)
    
-  Middleware de protection des routes
    
-  Préférences utilisateur (notifications, rythme, unités…)
    

---

#### 📄 Questionnaire initial

-  Formulaire d’entrée avec navigation fluide
    
-  Questions dynamiques selon le profil (ménopause ou non)
    
-  Sauvegarde des réponses en base
    
-  Déclenchement du calcul du cycle à la validation
    

---

#### 🩸 Calcul & gestion du cycle

-  Création d’un cycle menstruel (ou phase de ménopause)
    
-  Génération des phases (`Menstruelle`, `Folliculaire`, etc.)
    
-  Mise à jour automatique selon les dates
    
-  Bouton « début des règles » pour recalibrer en temps réel
    
-  Algorithme de prédiction des prochaines phases
    

---

#### 🧘 Base d’exercices

-  Création de la base d’exercices par phase
    
-  Données : nom, description, image, intensité, phase(s)
    
-  Filtres de recherche (objectif, durée, type, zone)
    
-  Liaison aux programmes
    
-  Ajout d’exercices personnalisés (optionnel)
    

---

#### 🧩 Création de programmes personnalisés

-  Interface de création de programme par jour
    
-  Association d’exercices selon les phases
    
-  Edition et duplication des programmes
    
-  Suivi de progression dans le temps
    

---

#### 🔔 Notifications push (Firebase)

-  Configuration Firebase FCM
    
-  Envoi de rappels liés aux séances
    
-  Notification des changements de phase
    
-  Activation/désactivation dans les préférences
    

---

#### 💬 Suivi d’humeur & douleurs (bonus)

-  Formulaire journalier (douleurs, humeur, énergie)
    
-  Visualisation de l’historique
    
-  Corrélation avec les phases du cycle
    

---

#### 📊 Suivi des performances (bonus)

-  Comptage des séances réalisées
    
-  Statistiques par phase / par semaine
    
-  Affichage dans le profil utilisateur
    

---

#### 🛠️ Backend & API

-  Architecture Nest.js modulaire
    
-  Création des endpoints REST sécurisés
    
-  Validation des données (DTOs)
    
-  Gestion des erreurs & messages utilisateur
    
-  Tests unitaires sur les endpoints
    

---

#### 🖥️ Frontend Mobile

-  Pages : Login, Accueil, Questionnaire, Exercices, Programmes, Profil
    
-  Gestion de la navigation (React Navigation)
    
-  Intégration avec l’API backend
    
-  Affichage dynamique selon la phase du jour
    

---

#### 🗄️ Base de données & Migrations

-  Modélisation des tables principales (`User`, `Cycle`, `Phase`, `Exercise`, etc.)
    
-  Relations entre entités
    
-  Création des migrations PostgreSQL
    
-  Tests avec données factices
    

---

#### 🐳 DevOps & Infrastructure

-  Setup Docker (`docker-compose.yml`)
    
-  Variables d’environnement (.env)
    
-  Base PostgreSQL en container
    
-  Pipeline CI/CD avec GitHub Actions (optionnel)
    
-  Export Obsidian + PDF
    

---

### ✅ Synthèse

|Domaine|Responsable(s) principaux|
|---|---|
|UI/UX|Lazaro, Léna|
|Backend|Quentin|
|BDD|Léna|
|DevOps|Lazaro|
|Notifications|Lazaro (Firebase)|
|Coordination projet|Léna|


<div style="page-break-after: always;"></div>

# 🚀 Premier Sprint  <a name="premier-sprint"></a>


___
>  **🗓️ Période du Sprint**
> 
> **Du 17 Juin au 1er Juillet 2025**
> 
> ---
> 
>  **🎯 Objectifs du Sprint 1**
> 
> Ce premier sprint a pour objectif de poser les **fondations fonctionnelles** de l’application. Il comprend la mise en place des fonctionnalités clés liées à l’utilisateur et aux premières logiques métier.
> 
> Livrables attendus :
> 
> - ✅ **Système d’authentification** simple (login avec e-mail et mot de passe)
>     
> - ✅ **Initialisation du cycle utilisateur** à la première connexion
>     
> - ✅ **Affichage d’une base d’exercices**, classés par phase hormonale
>     
> - ✅ **Création de programme personnalisé**, en fonction du cycle
>     
> 
> ---
> 
>  **👨‍💻 Charge de travail estimée**
> 
> Chaque membre de l’équipe s’engage à réaliser **5 JH (jours/homme)** durant ce sprint.
> 
> Répartition des tâches :
> 
> - **Frontend** : Interfaces de login, affichage des exercices selon la phase, création de programme
>     
> - **Backend** : Endpoints d’authentification, logique de suivi du cycle, API des exercices
>     
> - **Base de données** : Modélisation des entités `User`, `Exercise`, `Program`
>     
> - **DevOps** : Configuration Docker, gestion des variables d’environnement, premier déploiement
>     
> 
> Ce sprint vise à produire une base fonctionnelle et testable pour les phases suivantes du projet.

# 🧱 Infrastructure <a name="infrastructure"></a>


___
> L'infrastructure du projet FitMe a été pensée pour garantir un environnement de développement cohérent, reproductible, et facilement déployable, tout en restant adaptée à une équipe étudiante avec des ressources limitées.
> 
> ---
> 
>  **🐳 Docker pour la containerisation**
> 
> L’ensemble de notre stack technique (backend, base de données, etc.) est conteneurisé avec **Docker**.  
> Ce choix permet de :
> 
> - Travailler dans des environnements homogènes pour tous les membres de l’équipe
>     
> - Réduire les erreurs liées aux différences locales (« _ça marche chez moi_ »)
>     
> - Faciliter le déploiement futur, que ce soit en local ou dans le cloud
>     
> 
> Chaque composant (Nest.js, PostgreSQL, etc.) sera défini dans un `docker-compose.yml` pour permettre un démarrage rapide du projet via une seule commande.
> 
> ---
> 
>  **🔁 GitHub Actions pour l’intégration et le déploiement continus (CI/CD)**
> 
> Si le temps le permet, nous mettrons en place des **pipelines CI/CD** avec **GitHub Actions**.  
> Cela permettra :
> 
> - De lancer des tests automatiquement à chaque _push_
>     
> - De vérifier la qualité du code (lint, build)
>     
> - De déployer automatiquement en local ou sur un serveur de test
>     
> 
> Cette étape n’est pas prioritaire pour le MVP mais elle est prévue dans une optique de professionnalisation et de stabilité du projet à moyen terme.
> 
> ---
> 
> ** 🗄️ PostgreSQL hébergé en local via Docker**
> 
> La base de données principale du projet sera **PostgreSQL**, hébergée localement via un container Docker.  
> Cela permet de :
> 
> - Simuler un environnement de production sans dépendance à un serveur distant
>     
> - Avoir un contrôle total sur la structure et les performances
>     
> - Partager des exports ou volumes facilement entre les membres
>     
> 
> Ce choix est pertinent pour une application MVP ayant un schéma relationnel bien défini (utilisateur, cycle, programme, exercice, etc.).
> 
> ---
> 
>  **🔔 Intégration de Firebase pour les notifications push**
> 
> **Firebase Cloud Messaging (FCM)** sera utilisé pour envoyer des notifications push aux utilisatrices (ex. rappels de séance, changements de phase hormonale, messages de motivation, etc.).  
> Firebase a été choisi car :
> 
> - Il est **gratuit jusqu’à un seuil largement suffisant pour un POC ou MVP**
>     
> - Son **intégration avec React Native** est bien documentée
>     
> - Il ne nécessite pas de serveur dédié à la gestion des notifications
>     
> 
> Cette solution nous permettra d’améliorer significativement l'engagement utilisateur sans complexifier notre architecture backend.


<div style="page-break-after: always;"></div>

# 🖼️ Maquettage  <a name="maquettage"></a>

___
>Pour la phase de conception graphique, nous avons adopté une démarche structurée et collaborative :
> 
> Dans un premier temps, nous avons discuté des fonctionnalités nécessaires et des écrans à prévoir. Chaque besoin a ensuite été traduit en tâches distinctes, gérées via des cartes ou issues.
> 
> L’outil principal utilisé pour la conception UI est **Figma**, choisi pour sa flexibilité et sa facilité de collaboration en équipe.  
> **Lazaro** et **Léna** sont responsables de la création des wireframes et de la cohérence du parcours utilisateur.
> 
> Tout au long de cette phase, nous mettons l’accent sur une **expérience utilisateur intuitive**, avec une approche **mobile-first** adaptée à tous les types d’écrans.


<div style="page-break-after: always;"></div>

# 🧬 Conception BDD  <a name="conception-bdd"></a>


___
La base de données du projet **FitMe** repose sur **PostgreSQL**, un SGBD relationnel robuste et parfaitement adapté à notre besoin de structuration, de relations fortes et de contraintes d'intégrité.  
Elle permet de gérer de manière fiable les données personnelles des utilisatrices, leurs programmes, les exercices associés et les notifications dynamiques liées au cycle hormonal.

---

### 📋 Tables principales

| Table          | Description                                                                                                                      |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `User`         | Contient les données de base d’une utilisatrice (email, mot de passe hashé, prénom, date de naissance, statut ménopause, etc.)   |
| `Cycle`        | Représente un cycle menstruel déclaré par une utilisatrice (date de début, durée estimée, durée des règles, régularité, etc.)    |
| `Phase`        | Sous-division d’un cycle (`Menstruelle`, `Folliculaire`, `Ovulatoire`, `Lutéale`). Utilisée pour l'affichage ciblé des exercices |
| `Exercise`     | Base de données des exercices disponibles (nom, description, image, intensité, phase(s) recommandée(s), etc.)                    |
| `Program`      | Programme personnalisé créé par l’utilisatrice (titre, objectif, dates, liste d’exercices liés)                                  |
| `MoodTrack`    | (Bonus) Suivi de l’humeur, douleurs, symptômes journaliers entrés par l’utilisatrice                                             |
| `Notification` | Historique des notifications envoyées ou à venir (type, message, date, liée à une phase ou un programme)                         |

---

### ➕ Tables supplémentaires proposées

|Table|Description|
|---|---|
|`Program_Exercise`|Table de liaison pour gérer les exercices associés à un programme (`program_id`, `exercise_id`, `day`, `order`)|
|`Phase_Exercise`|Table de correspondance pour lier un exercice à une ou plusieurs phases recommandées|
|`ReminderSettings`|Préférences de rappel par utilisatrice (notifications activées, fréquence, créneau horaire, type de rappel)|
|`UserSettings`|Préférences globales de l’utilisatrice (unité, rythme, notifications, affichage, etc.)|
|`Log`|Journal des événements importants (login, mise à jour de profil, suppression de programme, erreurs, etc.) – utile en debug/devops|

---

### 🔗 Relations et intégrité

- Chaque `User` peut avoir plusieurs `Cycle`
    
- Chaque `Cycle` contient plusieurs `Phase`
    
- Un `Program` est lié à un `User`, et contient plusieurs `Exercise` via `Program_Exercise`
    
- Un `Exercise` peut être recommandé pour plusieurs `Phase` via `Phase_Exercise`
    
- Un `MoodTrack` appartient à un `User` et est daté
    
- Les `Notification` peuvent être liées soit à une phase, soit à un programme
    

Toutes les clés étrangères seront définies avec **contraintes d’intégrité** (`ON DELETE CASCADE` ou `RESTRICT` selon les cas), et des **index** seront placés sur les colonnes critiques pour optimiser les performances (ex: `user_id`, `phase_id`, `program_id`).

---

### ✅ Exemple de relations visuelles (description textuelle rapide)

- `User (1)` ⟶ `(n) Cycle`
    
- `Cycle (1)` ⟶ `(n) Phase`
    
- `User (1)` ⟶ `(n) Program`
    
- `Program (1)` ⟶ `(n) Program_Exercise` ⟶ `(1) Exercise`
    
- `Exercise (n)` ⟷ `(n) Phase` via `Phase_Exercise`
    
- `User (1)` ⟶ `(n) MoodTrack`
    
- `User (1)` ⟶ `(n) Notification`


<div style="page-break-after: always;"></div>

# 📑 Documentation  <a name="documentation"></a>


___
Afin de garantir la **traçabilité, la maintenabilité et la compréhension complète** du projet **FitMe**, une documentation rigoureuse sera mise en place tout au long du développement.

> 🗃️ **Support utilisé :** Vault **Obsidian**, structuré par sections, synchronisé entre les membres de l’équipe.  
> 📄 **Format de livraison :** Export **PDF complet** à rendre à la fin du projet.

---

### 📌 Contenu de la documentation

|Section|Description|
|---|---|
|**Structure de la BDD**|Diagrammes des entités (`User`, `Cycle`, `Phase`, etc.), relations, contraintes|
|**Endpoints backend**|Liste détaillée des routes API REST (authentification, cycle, exercices, programmes) avec méthodes, params, codes retour|
|**Flow utilisateur**|Parcours de l’utilisatrice depuis l’inscription jusqu’à la création de programme + logique de calcul des phases|
|**Gestion des erreurs**|Cas d'erreur prévus, gestion côté frontend/backend, réponses d’API, messages utilisateur|
|**Cas de test**|Tests unitaires et fonctionnels (authentification, création de cycle, affichage exercices) + étapes de validation manuelle|

---

### 📂 Organisation dans Obsidian

- `📁 Architecture` : schémas BDD, schémas logiques, microservices éventuels
    
- `📁 Backend` : endpoints, gestion des erreurs, configuration Docker
    
- `📁 Frontend` : structure de pages, composants critiques, UX flows
    
- `📁 Fonctionnel` : parcours utilisateur, questionnaire, gestion des phases
    
- `📁 Qualité` : checklists, cas de test, rapports de bugs
    

---

### ✅ Engagement qualité

- 📎 Documentation **mise à jour à chaque fin de sprint**
    
- 📤 Version **PDF générée automatiquement** à chaque itération finale
    
- 👨‍🏫 Utilisable comme support pour les **revues de sprint** et les démonstrations