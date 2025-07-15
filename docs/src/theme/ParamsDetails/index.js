import React from 'react';
import OriginalParamsDetails from '@theme-original/ParamsDetails';

export default function ParamsDetails(props) {
  // Filtre les props undefined pour éviter les erreurs
  const cleanProps = {};
  
  Object.keys(props).forEach(key => {
    if (props[key] !== undefined) {
      cleanProps[key] = props[key];
    }
  });

  return <OriginalParamsDetails {...cleanProps} />;
} 