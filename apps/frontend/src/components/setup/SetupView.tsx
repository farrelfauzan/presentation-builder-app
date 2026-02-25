'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Button,
  Input,
  Label,
  Separator,
} from '@presentation-builder-app/libs';
import { toast } from 'sonner';
import { useCreateSettings } from '@/lib/hooks';
import { Save, Upload, Loader2, X, Building2 } from 'lucide-react';

export function SetupView() {
  const router = useRouter();
  const createSettings = useCreateSettings();

  const [companyName, setCompanyName] = useState('');
  const [address, setAddress] = useState('');
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

    if (!companyName.trim()) {
      toast.error('Company name is required');
      return;
    }

    const formData = new FormData();
    formData.append('companyName', companyName.trim());
    if (address.trim()) formData.append('address', address.trim());
    if (email.trim()) formData.append('email', email.trim());
    if (website.trim()) formData.append('website', website.trim());
    if (logoFile) formData.append('logo', logoFile);

    try {
      await createSettings.mutateAsync(formData);
      toast.success('Setup complete!');
      router.push('/dashboard/projects');
    } catch {
      toast.error('Failed to save settings');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Building2 className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            Welcome to Presentation Builder
          </h1>
          <p className="text-sm text-muted-foreground">
            Set up your company information to get started. This will appear on
            your presentations.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
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
            <Label htmlFor="company-name">
              Company Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="company-name"
              placeholder="Acme Corp"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              required
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

          <Button
            type="submit"
            className="w-full"
            disabled={createSettings.isPending}
          >
            {createSettings.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Complete Setup
          </Button>
        </form>
      </div>
    </div>
  );
}
