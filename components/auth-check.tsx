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
          router.push('/login');
          return;
        }

        // Check if user has required role
        if (requiredRole) {
          const userRole = authService.getCurrentRole();

          // Student login is disabled
          if (requiredRole === 'student') {
            router.push('/');
            return;
          }

          if (!userRole || userRole !== requiredRole) {
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