'use client';

import { useRouter } from 'next/navigation';
import { useGlobalSettings } from '@/lib/hooks';
import { Loader2 } from 'lucide-react';
import { useEffect } from 'react';

interface SettingsGuardProps {
  children: React.ReactNode;
}

export function SettingsGuard({ children }: SettingsGuardProps) {
  const router = useRouter();
  const { data: settings, isLoading, isError } = useGlobalSettings();

  useEffect(() => {
    // If settings fetch completed and no settings exist, redirect to setup
    if (!isLoading && !settings && !isError) {
      router.replace('/setup');
    }
  }, [settings, isLoading, isError, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // While redirecting, show nothing
  if (!settings && !isError) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return <>{children}</>;
}
