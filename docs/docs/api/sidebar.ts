import type { SidebarsConfig } from "@docusaurus/plugin-content-docs";

const sidebar: SidebarsConfig = {
  apisidebar: [
    {
      type: "doc",
      id: "api/fitme-api",
    },
    {
      type: "category",
      label: "Auth",
      link: {
        type: "doc",
        id: "api/auth",
      },
      items: [
        {
          type: "doc",
          id: "api/auth-controller-register",
          label: "Inscription d'un nouvel utilisateur",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/auth-controller-login",
          label: "Connexion utilisateur",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/auth-controller-refresh",
          label: "Rafraîchissement du token d'accès",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/auth-controller-get-profile",
          label: "Récupérer le profil de l'utilisateur connecté",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/auth-controller-test-public",
          label: "Route de test publique (aucune authentification requise)",
          className: "api-method get",
        },
      ],
    },
    {
      type: "category",
      label: "Status",
      link: {
        type: "doc",
        id: "api/status",
      },
      items: [
        {
          type: "doc",
          id: "api/status-controller-get-app-status-json",
          label: "Get application status in JSON format",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/status-controller-get-app-status-page",
          label: "StatusController_getAppStatusPage",
          className: "api-method get",
        },
      ],
    },
    {
      type: "category",
      label: "Cycle",
      link: {
        type: "doc",
        id: "api/cycle",
      },
      items: [
        {
          type: "doc",
          id: "api/cycle-controller-get-current-phase",
          label: "Récupérer la phase actuelle du cycle",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/cycle-controller-get-cycle-config",
          label: "Récupérer la configuration du cycle",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/cycle-controller-update-cycle-config",
          label: "Mettre à jour la configuration du cycle",
          className: "api-method put",
        },
        {
          type: "doc",
          id: "api/cycle-controller-log-period",
          label: "Enregistrer des règles",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/cycle-controller-get-periods-history",
          label: "Récupérer l'historique des règles",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/cycle-controller-get-cycle-predictions",
          label: "Obtenir les prédictions du cycle",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/cycle-controller-get-cycle-calendar",
          label: "Obtenir le calendrier du cycle",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/cycle-controller-log-symptoms",
          label: "Enregistrer des symptômes",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/cycle-controller-get-symptoms-history",
          label: "Récupérer l'historique des symptômes",
          className: "api-method get",
        },
      ],
    },
    {
      type: "category",
      label: "Exercises",
      link: {
        type: "doc",
        id: "api/exercises",
      },
      items: [
        {
          type: "doc",
          id: "api/exercise-controller-get-exercises",
          label: "Récupérer les exercices par phase de cycle",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/exercise-controller-create-exercise",
          label: "Créer un nouvel exercice",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/exercise-controller-get-favorite-exercises",
          label: "Récupérer la liste des exercices favoris",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/exercise-controller-get-exercise-details",
          label: "Récupérer les détails complets d'un exercice",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/exercise-controller-add-to-favorites",
          label: "Ajouter un exercice aux favoris",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/exercise-controller-remove-from-favorites",
          label: "Retirer un exercice des favoris",
          className: "api-method delete",
        },
        {
          type: "doc",
          id: "api/exercise-controller-rate-exercise",
          label: "Noter un exercice",
          className: "api-method post",
        },
      ],
    },
    {
      type: "category",
      label: "Programs",
      link: {
        type: "doc",
        id: "api/programs",
      },
      items: [
        {
          type: "doc",
          id: "api/program-controller-generate-program",
          label: "Générer un programme d'entraînement adapté à la phase de cycle",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/program-controller-create-program",
          label: "Créer un nouveau programme",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/program-controller-get-user-programs",
          label: "Récupérer les programmes de l'utilisateur",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/program-controller-get-program-by-id",
          label: "Récupérer un programme par ID",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/program-controller-update-program",
          label: "Mettre à jour un programme",
          className: "api-method put",
        },
        {
          type: "doc",
          id: "api/program-controller-delete-program",
          label: "Supprimer un programme",
          className: "api-method delete",
        },
        {
          type: "doc",
          id: "api/program-controller-start-program",
          label: "Démarrer un programme",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/program-controller-pause-program",
          label: "Mettre en pause un programme",
          className: "api-method put",
        },
        {
          type: "doc",
          id: "api/program-controller-resume-program",
          label: "Reprendre un programme",
          className: "api-method put",
        },
        {
          type: "doc",
          id: "api/program-controller-complete-program",
          label: "Marquer un programme comme terminé",
          className: "api-method put",
        },
        {
          type: "doc",
          id: "api/program-controller-get-program-status",
          label: "Récupérer le statut d'un programme",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/program-controller-get-program-progress",
          label: "Récupérer la progression d'un programme",
          className: "api-method get",
        },
      ],
    },
  ],
};

export default sidebar.apisidebar;
