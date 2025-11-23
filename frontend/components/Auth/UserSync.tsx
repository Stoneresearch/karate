'use client';
import { useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useMutation } from 'convex/react';
import { api } from '../../lib/convex/api';

export function UserSync() {
  const { user } = useUser();
  const storeUser = useMutation(api.users.getOrCreate);

  useEffect(() => {
    if (user && user.primaryEmailAddress?.emailAddress) {
      // This ensures the user exists in Convex AND links their Clerk ID (tokenIdentifier)
      storeUser({
        email: user.primaryEmailAddress.emailAddress,
        name: user.fullName || user.username || 'User',
      }).catch(err => console.error('UserSync failed:', err));
    }
  }, [user, storeUser]);

  return null;
}

