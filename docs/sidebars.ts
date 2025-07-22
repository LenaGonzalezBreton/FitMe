/**
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation

 The sidebars can be generated from the filesystem, or explicitly defined here.

 Create as many sidebars as you want.
 */

// @ts-check
import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  sidebar: [
    {
      type: 'category',
      label: 'App Mobile',
      items: [
        'mobile/getting-started',
        'mobile/faq',
      ],
    },
    {
      type: 'category',
      label: 'API FitMe',
      link: {
        type: 'generated-index',
        title: 'API FitMe',
        description: 'Documentation de l\'API FitMe pour l\'application de fitness adaptée au cycle menstruel',
        slug: '/category/fitme-api'
      },
      items: require('./docs/api/sidebar.js'), // Fichier JavaScript compatible
    },
  ],
};

module.exports = sidebars;