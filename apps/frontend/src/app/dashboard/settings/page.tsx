'use client';

import { SettingsForm } from '../../../components/settings/SettingsForm';

export default function SettingsPage() {
  return (
    <div className="container mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Manage your company settings that appear on presentations
        </p>
      </div>

      <SettingsForm />
    </div>
  );
}
