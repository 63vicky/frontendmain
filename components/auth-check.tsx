'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { authService } from '@/lib/services/auth';

interface AuthCheckProps {
  children: React.ReactNode;
  requiredRole?: string;
}

export function AuthCheck({ children, requiredRole }: AuthCheckProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check if user is authenticated
        if (!authService.isAuthenticated()) {
          console.log('User not authenticated, redirecting to login');
          router.push('/login');
          return;
        }

        // Check if user has required role
        if (requiredRole) {
          const userRole = authService.getCurrentRole();
          console.log(`Checking role: User has ${userRole}, required ${requiredRole}`);
          
          if (!userRole || userRole !== requiredRole) {
            console.log(`Role mismatch: User has ${userRole}, required ${requiredRole}`);
            router.push('/login');
            return;
          }
        }
        
        setIsChecking(false);
      } catch (error) {
        console.error('Auth check error:', error);
        router.push('/login');
      }
    };

    checkAuth();
  }, [router, pathname, requiredRole]);

  if (isChecking) {
    return <div>Loading...</div>;
  }

  return <>{children}</>;
} 