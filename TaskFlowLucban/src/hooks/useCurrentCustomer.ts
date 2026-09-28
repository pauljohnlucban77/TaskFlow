import { useAuth } from '../context/AuthContext';

/**
 * Custom hook to get the current authenticated customer's identity.
 * This is the SINGLE source of truth for who is submitting or viewing feedback.
 */
export function useCurrentCustomer() {
  const { user, uid, email, isMockUser } = useAuth();

  return {
    customerId: uid,
    customerName: email ? email.split('@')[0] : 'Valued Customer',
    email,
    isAuthenticated: !!user || isMockUser,
    isMockUser,
  };
}
