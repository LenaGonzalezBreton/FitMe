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
  ],
};

export default sidebar.apisidebar;
