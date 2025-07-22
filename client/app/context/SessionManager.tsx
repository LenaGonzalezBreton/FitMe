import { AuthContext } from './AuthContext';
import { useContext } from 'react';

export function logout() {
  // This pulls the logout function from React context
  const ctx = useContext(AuthContext);
  if (ctx) ctx.logout();
}
