import React from 'react';
import OriginalRequestSchema from '@theme-original/RequestSchema';

export default function RequestSchema(props) {
  // Filtre les props undefined pour éviter les erreurs
  const cleanProps = {};
  
  Object.keys(props).forEach(key => {
    if (props[key] !== undefined) {
      cleanProps[key] = props[key];
    }
  });

  // Ne rend rien si le body est undefined ou si son contenu est vide
  if (!cleanProps.body || Object.keys(cleanProps.body).length === 0) {
    return null;
  }
  
  return <OriginalRequestSchema {...cleanProps} />;
} 