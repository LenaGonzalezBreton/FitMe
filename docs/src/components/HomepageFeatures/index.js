import React from 'react';
import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

const FeatureList = [
  {
    title: 'Fitness Adaptatif',
    Svg: require('@site/static/img/undraw_docusaurus_mountain.svg').default,
    description: (
      <>
        Des entraînements qui s'adaptent automatiquement à votre cycle menstruel
        pour optimiser vos performances et respecter votre corps.
      </>
    ),
  },
  {
    title: 'Suivi Intelligent',
    Svg: require('@site/static/img/undraw_docusaurus_tree.svg').default,
    description: (
      <>
        Synchronisation avec vos applications de santé préférées pour un suivi
        complet de votre cycle, humeur et progression fitness.
      </>
    ),
  },
  {
    title: 'Documentation Complète',
    Svg: require('@site/static/img/undraw_docusaurus_react.svg').default,
    description: (
      <>
        Guide utilisateur détaillé et documentation API pour développeurs.
        Tout ce dont vous avez besoin pour utiliser et intégrer FitMe.
      </>
    ),
  },
];

function Feature({Svg, title, description}) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        <Svg className={styles.featureSvg} role="img" />
      </div>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures() {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
