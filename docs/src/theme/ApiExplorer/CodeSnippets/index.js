import React from 'react';
import OriginalCodeSnippets from '@theme-original/ApiExplorer/CodeSnippets';

// Wrapper pour gérer les cas où il n'y a pas d'exemples de code
export default function CodeSnippets(props) {
  // Si 'codeSamples' est absent ou vide, on ne rend rien pour éviter l'erreur.
  if (!props.codeSamples || props.codeSamples.length === 0) {
    return null;
  }

  // Sinon, on rend le composant original avec les props reçues.
  return <OriginalCodeSnippets {...props} />;
} 