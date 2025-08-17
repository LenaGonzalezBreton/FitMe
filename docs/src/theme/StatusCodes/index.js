import React from 'react';
import OriginalStatusCodes from '@theme-original/StatusCodes';

export default function StatusCodes(props) {
  // Filtre les props undefined pour éviter les erreurs
  const cleanProps = {};
  
  Object.keys(props).forEach(key => {
    if (props[key] !== undefined) {
      cleanProps[key] = props[key];
    }
  });

  return <OriginalStatusCodes {...cleanProps} />;
} 