'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Button,
  Input,
  Label,
  Separator,
} from '@presentation-builder-app/libs';
import { toast } from 'sonner';
import {
  useGlobalSettings,
  useCreateSettings,
  useUpdateSettings,
} from '@/lib/hooks';
import { Save, Upload, Loader2, X } from 'lucide-react';
import type { GlobalSettings } from '@/lib/api';

export function SettingsForm() {
  const { data: settings, isLoading } = useGlobalSettings();
  const createSettings = useCreateSettings();
  const updateSettings = useUpdateSettings();

  const [companyName, setCompanyName] = useState('');
  const [address, setAddress] = useState('');
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const hasExisting = !!settings;

  useEffect(() => {
    if (settings) {
      setCompanyName(settings.companyName || '');
      setAddress(settings.address || '');
      setEmail(settings.email || '');
      setWebsite(settings.website || '');
      setLogoUrl(settings.logoUrl);
    }
  }, [settings]);

  const handleLogoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoFile(file);
    setLogoUrl(URL.createObjectURL(file));
  };

  const handleRemoveLogo = () => {
    setLogoFile(null);
    setLogoUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData();
    if (companyName.trim()) formData.append('companyName', companyName.trim());
    if (address.trim()) formData.append('address', address.trim());
    if (email.trim()) formData.append('email', email.trim());
    if (website.trim()) formData.append('website', website.trim());
    if (logoFile) {
      formData.append('logo', logoFile);
    } else if (!logoUrl && hasExisting && settings?.logoUrl) {
      formData.append('deleteLogo', 'true');
    }

    try {
      if (hasExisting) {
        await updateSettings.mutateAsync(formData);
      } else {
        await createSettings.mutateAsync(formData);
      }
      toast.success('Settings saved successfully');
      setLogoFile(null);
    } catch {
      toast.error('Failed to save settings');
    }
  };

  const isSaving = createSettings.isPending || updateSettings.isPending;

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="h-4 w-24 bg-muted rounded" />
            <div className="h-10 w-full bg-muted rounded" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-lg">
      {/* Logo */}
      <div className="space-y-2">
        <Label>Company Logo</Label>
        {logoUrl ? (
          <div className="space-y-2">
            <div className="relative inline-block rounded-md border overflow-hidden">
              <img
                src={logoUrl}
                alt="Company logo"
                className="h-24 w-auto object-contain"
              />
              <button
                type="button"
                onClick={handleRemoveLogo}
                className="absolute top-1 right-1 rounded-full bg-black/60 p-1 text-white hover:bg-black/80"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          </div>
        ) : (
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleLogoSelect}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="mr-2 h-3.5 w-3.5" />
              Upload Logo
            </Button>
          </div>
        )}
      </div>

      <Separator />

      {/* Company Name */}
      <div className="space-y-2">
        <Label htmlFor="company-name">Company Name</Label>
        <Input
          id="company-name"
          placeholder="Acme Corp"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
        />
      </div>

      {/* Address */}
      <div className="space-y-2">
        <Label htmlFor="address">Address</Label>
        <Input
          id="address"
          placeholder="123 Main Street, City, Country"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />
      </div>

      {/* Email */}
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="contact@company.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      {/* Website */}
      <div className="space-y-2">
        <Label htmlFor="website">Website</Label>
        <Input
          id="website"
          placeholder="https://company.com"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
        />
      </div>

      <Button type="submit" disabled={isSaving}>
        {isSaving ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Save className="mr-2 h-4 w-4" />
        )}
        Save Settings
      </Button>
    </form>
  );
}
