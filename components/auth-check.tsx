'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { authService } from '@/lib/services/auth';

interface AuthCheckProps {
  children: React.ReactNode;
  requiredRole?: string;
}

export function AuthCheck({ children, requiredRole }: AuthCheckProps) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Check if user is authenticated
    if (!authService.isAuthenticated()) {
      router.push('/login');
      return;
    }

    // Check if user has required role
    if (requiredRole && !authService.hasRole(requiredRole)) {
      router.push('/dashboard');
      return;
    }
  }, [router, pathname, requiredRole]);

  return <>{children}</>;
} 