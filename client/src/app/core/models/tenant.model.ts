export interface TenantDto {
  id: string;
  name: string;
  code: string;
  email?: string;
  phone?: string;
  address?: string;
  logoUrl?: string;
  isActive: boolean;
  featureFlags: FeatureFlagDto[];
}

export interface CreateTenantRequest {
  name: string;
  code: string;
  email?: string;
  phone?: string;
  address?: string;
  adminEmail: string;
  adminPassword: string;
  adminFirstName: string;
  adminLastName: string;
}

export interface UpdateTenantRequest {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  logoUrl?: string;
}

export interface FeatureFlagDto {
  id: string;
  featureType: string;
  isEnabled: boolean;
  configuration?: string;
}
