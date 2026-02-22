import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { TenantService } from '@core/services/data.service';
import { TenantDto } from '@core/models';

interface CountryCode { name: string; dial: string; code: string; phonePlaceholder: string; phonePattern: RegExp; }

const COUNTRY_CODES: CountryCode[] = [
  { name: 'Egypt', dial: '+20', code: 'EG', phonePlaceholder: '1XXXXXXXXX', phonePattern: /^[12][0-9]{9}$/ },
  { name: 'Saudi Arabia', dial: '+966', code: 'SA', phonePlaceholder: '5XXXXXXXX', phonePattern: /^5[0-9]{8}$/ },
  { name: 'UAE', dial: '+971', code: 'AE', phonePlaceholder: '5XXXXXXXX', phonePattern: /^5[0-9]{8}$/ },
  { name: 'Kuwait', dial: '+965', code: 'KW', phonePlaceholder: 'XXXXXXXX', phonePattern: /^[0-9]{8}$/ },
  { name: 'Qatar', dial: '+974', code: 'QA', phonePlaceholder: 'XXXXXXXX', phonePattern: /^[0-9]{8}$/ },
  { name: 'Bahrain', dial: '+973', code: 'BH', phonePlaceholder: 'XXXXXXXX', phonePattern: /^[0-9]{8}$/ },
  { name: 'Oman', dial: '+968', code: 'OM', phonePlaceholder: 'XXXXXXXX', phonePattern: /^[0-9]{8}$/ },
  { name: 'Jordan', dial: '+962', code: 'JO', phonePlaceholder: '7XXXXXXXX', phonePattern: /^7[0-9]{8}$/ },
  { name: 'Lebanon', dial: '+961', code: 'LB', phonePlaceholder: 'XXXXXXXX', phonePattern: /^[0-9]{7,8}$/ },
  { name: 'Iraq', dial: '+964', code: 'IQ', phonePlaceholder: '7XXXXXXXXX', phonePattern: /^7[0-9]{9}$/ },
  { name: 'United States', dial: '+1', code: 'US', phonePlaceholder: 'XXXXXXXXXX', phonePattern: /^[2-9][0-9]{9}$/ },
  { name: 'United Kingdom', dial: '+44', code: 'GB', phonePlaceholder: '7XXXXXXXXX', phonePattern: /^7[0-9]{9}$/ },
  { name: 'India', dial: '+91', code: 'IN', phonePlaceholder: 'XXXXXXXXXX', phonePattern: /^[6-9][0-9]{9}$/ },
  { name: 'Turkey', dial: '+90', code: 'TR', phonePlaceholder: '5XXXXXXXXX', phonePattern: /^5[0-9]{9}$/ },
  { name: 'Pakistan', dial: '+92', code: 'PK', phonePlaceholder: '3XXXXXXXXX', phonePattern: /^3[0-9]{9}$/ },
  { name: 'Morocco', dial: '+212', code: 'MA', phonePlaceholder: '6XXXXXXXX', phonePattern: /^[67][0-9]{8}$/ },
  { name: 'Tunisia', dial: '+216', code: 'TN', phonePlaceholder: 'XXXXXXXX', phonePattern: /^[0-9]{8}$/ },
  { name: 'Algeria', dial: '+213', code: 'DZ', phonePlaceholder: '5XXXXXXXX', phonePattern: /^[567][0-9]{8}$/ },
  { name: 'Libya', dial: '+218', code: 'LY', phonePlaceholder: '9XXXXXXXX', phonePattern: /^9[0-9]{8}$/ },
  { name: 'Sudan', dial: '+249', code: 'SD', phonePlaceholder: '9XXXXXXXX', phonePattern: /^9[0-9]{8}$/ },
  { name: 'Germany', dial: '+49', code: 'DE', phonePlaceholder: '1XXXXXXXXX', phonePattern: /^1[0-9]{9,10}$/ },
  { name: 'France', dial: '+33', code: 'FR', phonePlaceholder: '6XXXXXXXX', phonePattern: /^[67][0-9]{8}$/ },
  { name: 'Canada', dial: '+1', code: 'CA', phonePlaceholder: 'XXXXXXXXXX', phonePattern: /^[2-9][0-9]{9}$/ },
  { name: 'Australia', dial: '+61', code: 'AU', phonePlaceholder: '4XXXXXXXX', phonePattern: /^4[0-9]{8}$/ },
];

@Component({
  selector: 'app-tenant-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <!-- Page Header -->
    <div class="mb-6 flex items-center justify-between">
      <h1 class="text-lg font-semibold text-gray-800 dark:text-white/90">Schools (Tenants)</h1>
      <button class="rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white shadow-theme-xs hover:bg-brand-600" (click)="toggleForm()">{{ showForm ? 'Cancel' : '+ Add School' }}</button>
    </div>

    <!-- Error Alert -->
    <div class="mb-4 flex items-center gap-3 rounded-lg border border-error-200 bg-error-50 p-3 text-sm text-error-700 dark:border-error-800 dark:bg-error-500/10 dark:text-error-400" *ngIf="errorMessage">
      <span class="flex-shrink-0 text-lg">⚠</span>
      <span class="flex-1">{{ errorMessage }}</span>
      <button class="cursor-pointer border-none bg-transparent text-inherit opacity-70 hover:opacity-100" (click)="errorMessage = ''">✕</button>
    </div>

    <!-- Success Alert -->
    <div class="mb-4 flex items-center gap-3 rounded-lg border border-success-200 bg-success-50 p-3 text-sm text-success-700 dark:border-success-800 dark:bg-success-500/10 dark:text-success-400" *ngIf="successMessage">
      <span class="flex-shrink-0 text-lg">✓</span>
      <span class="flex-1">{{ successMessage }}</span>
      <button class="cursor-pointer border-none bg-transparent text-inherit opacity-70 hover:opacity-100" (click)="successMessage = ''">✕</button>
    </div>

    <!-- Create Form Card -->
    <div class="mb-6 rounded-2xl border border-gray-200 bg-white p-5 lg:p-6 dark:border-gray-800 dark:bg-white/[0.03]" *ngIf="showForm">
      <h3 class="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">Onboard New School</h3>
      <form [formGroup]="schoolForm" (ngSubmit)="create()">
        <!-- School Info -->
        <div class="mb-3 mt-2 border-b border-gray-100 pb-2 text-xs font-bold uppercase tracking-wider text-gray-500 dark:border-gray-800 dark:text-gray-400">School Information</div>
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div class="mb-4">
            <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">School Name <span class="text-error-500">*</span></label>
            <input formControlName="name" placeholder="e.g. Al Abtal Academy" class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800" />
            <div class="mt-1 text-xs text-error-500" *ngIf="showError('name')">
              <span *ngIf="schoolForm.get('name')?.errors?.['required']">School name is required.</span>
              <span *ngIf="schoolForm.get('name')?.errors?.['minlength']">Must be at least 2 characters.</span>
              <span *ngIf="schoolForm.get('name')?.errors?.['maxlength']">Must be under 100 characters.</span>
            </div>
          </div>
          <div class="mb-4">
            <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">Subdomain / Code <span class="text-error-500">*</span></label>
            <input formControlName="code" placeholder="e.g. al-abtal" class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800" />
            <div class="mt-1 text-xs text-gray-400" *ngIf="!showError('code')">Lowercase letters, numbers, and hyphens only.</div>
            <div class="mt-1 text-xs text-error-500" *ngIf="showError('code')">
              <span *ngIf="schoolForm.get('code')?.errors?.['required']">Subdomain code is required.</span>
              <span *ngIf="schoolForm.get('code')?.errors?.['minlength']">Must be at least 3 characters.</span>
              <span *ngIf="schoolForm.get('code')?.errors?.['maxlength']">Must be under 50 characters.</span>
              <span *ngIf="schoolForm.get('code')?.errors?.['pattern']">Only lowercase letters, numbers, and hyphens allowed.</span>
            </div>
          </div>
        </div>
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div class="mb-4">
            <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">Contact Email</label>
            <input formControlName="email" type="email" placeholder="e.g. info&#64;school.com" class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800" />
            <div class="mt-1 text-xs text-error-500" *ngIf="showError('email')">
              <span *ngIf="schoolForm.get('email')?.errors?.['email']">Enter a valid email address.</span>
            </div>
          </div>
          <div class="mb-4">
            <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">Phone</label>
            <div class="flex gap-2">
              <select formControlName="countryCode" class="h-11 w-[45%] flex-shrink-0 rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800">
                <option value="">Country</option>
                <option *ngFor="let c of countries" [value]="c.code">{{ c.name }} ({{ c.dial }})</option>
              </select>
              <input formControlName="phoneNumber" class="h-11 min-w-0 flex-1 rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
                     [placeholder]="selectedCountry?.phonePlaceholder || 'Phone number'" />
            </div>
            <div class="mt-1 text-xs text-error-500" *ngIf="showError('phoneNumber')">
              <span *ngIf="schoolForm.get('phoneNumber')?.errors?.['invalidPhone']">
                Invalid phone number for {{ selectedCountry?.name || 'selected country' }}.
              </span>
            </div>
            <div class="mt-1 text-xs text-error-500" *ngIf="schoolForm.get('phoneNumber')?.value && !schoolForm.get('countryCode')?.value">
              <span>Please select a country first.</span>
            </div>
          </div>
        </div>

        <!-- Admin Account -->
        <div class="mb-3 mt-2 border-b border-gray-100 pb-2 text-xs font-bold uppercase tracking-wider text-gray-500 dark:border-gray-800 dark:text-gray-400">Admin Account</div>
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div class="mb-4">
            <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">Admin Email <span class="text-error-500">*</span></label>
            <input formControlName="adminEmail" type="email" placeholder="e.g. admin&#64;school.com" class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800" />
            <div class="mt-1 text-xs text-error-500" *ngIf="showError('adminEmail')">
              <span *ngIf="schoolForm.get('adminEmail')?.errors?.['required']">Admin email is required.</span>
              <span *ngIf="schoolForm.get('adminEmail')?.errors?.['email']">Enter a valid email address.</span>
            </div>
          </div>
          <div class="mb-4">
            <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">Admin Password <span class="text-error-500">*</span></label>
            <div class="relative">
              <input formControlName="adminPassword" [type]="showPassword ? 'text' : 'password'" placeholder="Min 8 chars, uppercase, number, symbol" class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 pr-10 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800" />
              <button type="button" class="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer border-none bg-transparent text-base" (click)="showPassword = !showPassword">
                {{ showPassword ? '🙈' : '👁' }}
              </button>
            </div>
            <div class="mt-1.5 flex items-center gap-2" *ngIf="schoolForm.get('adminPassword')?.value">
              <div class="h-1 flex-1 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                <div class="h-full rounded-full transition-all duration-300" [style.width.%]="passwordStrength"
                     [ngClass]="{
                       'bg-error-500': passwordStrengthClass === 'weak',
                       'bg-warning-500': passwordStrengthClass === 'fair',
                       'bg-brand-500': passwordStrengthClass === 'good',
                       'bg-success-500': passwordStrengthClass === 'strong'
                     }"></div>
              </div>
              <span class="text-xs font-semibold uppercase"
                    [ngClass]="{
                      'text-error-500': passwordStrengthClass === 'weak',
                      'text-warning-500': passwordStrengthClass === 'fair',
                      'text-brand-500': passwordStrengthClass === 'good',
                      'text-success-500': passwordStrengthClass === 'strong'
                    }">{{ passwordStrengthLabel }}</span>
            </div>
            <div class="mt-1 text-xs text-error-500" *ngIf="showError('adminPassword')">
              <span *ngIf="schoolForm.get('adminPassword')?.errors?.['required']">Password is required.</span>
              <span *ngIf="schoolForm.get('adminPassword')?.errors?.['minlength']">Must be at least 8 characters.</span>
              <span *ngIf="schoolForm.get('adminPassword')?.errors?.['passwordStrength']">
                {{ schoolForm.get('adminPassword')?.errors?.['passwordStrength'] }}
              </span>
            </div>
          </div>
        </div>
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div class="mb-4">
            <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">Admin First Name <span class="text-error-500">*</span></label>
            <input formControlName="adminFirstName" placeholder="e.g. Ahmed" class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800" />
            <div class="mt-1 text-xs text-error-500" *ngIf="showError('adminFirstName')">
              <span *ngIf="schoolForm.get('adminFirstName')?.errors?.['required']">First name is required.</span>
              <span *ngIf="schoolForm.get('adminFirstName')?.errors?.['minlength']">Must be at least 2 characters.</span>
              <span *ngIf="schoolForm.get('adminFirstName')?.errors?.['maxlength']">Must be under 50 characters.</span>
            </div>
          </div>
          <div class="mb-4">
            <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">Admin Last Name <span class="text-error-500">*</span></label>
            <input formControlName="adminLastName" placeholder="e.g. Fahmy" class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800" />
            <div class="mt-1 text-xs text-error-500" *ngIf="showError('adminLastName')">
              <span *ngIf="schoolForm.get('adminLastName')?.errors?.['required']">Last name is required.</span>
              <span *ngIf="schoolForm.get('adminLastName')?.errors?.['minlength']">Must be at least 2 characters.</span>
              <span *ngIf="schoolForm.get('adminLastName')?.errors?.['maxlength']">Must be under 50 characters.</span>
            </div>
          </div>
        </div>

        <button type="submit" class="mt-2 rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-medium text-white shadow-theme-xs hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-60" [disabled]="creating || schoolForm.invalid">
          {{ creating ? 'Creating...' : 'Create School' }}
        </button>
      </form>
    </div>

    <!-- Table Card -->
    <div class="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
      <table class="w-full table-auto">
        <thead>
          <tr class="border-b border-gray-100 dark:border-gray-800">
            <th class="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">School Name</th>
            <th class="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Subdomain</th>
            <th class="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Email</th>
            <th class="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Phone</th>
            <th class="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Status</th>
            <th class="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
          <tr *ngFor="let t of tenants" class="hover:bg-gray-50 dark:hover:bg-white/[0.02]">
            <td class="px-5 py-3 text-sm text-gray-700 dark:text-gray-300">{{ t.name }}</td>
            <td class="px-5 py-3 text-sm text-gray-700 dark:text-gray-300">{{ t.code }}</td>
            <td class="px-5 py-3 text-sm text-gray-700 dark:text-gray-300">{{ t.email || '—' }}</td>
            <td class="px-5 py-3 text-sm text-gray-700 dark:text-gray-300">{{ t.phone || '—' }}</td>
            <td class="px-5 py-3 text-sm text-gray-700 dark:text-gray-300">
              <span *ngIf="t.isActive" class="inline-flex rounded-full bg-success-50 px-2 py-0.5 text-xs font-medium text-success-600 dark:bg-success-500/10 dark:text-success-400">Active</span>
              <span *ngIf="!t.isActive" class="inline-flex rounded-full bg-error-50 px-2 py-0.5 text-xs font-medium text-error-600 dark:bg-error-500/10 dark:text-error-400">Inactive</span>
            </td>
            <td class="px-5 py-3 text-sm text-gray-700 dark:text-gray-300">
              <button class="rounded-lg bg-error-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-error-600" (click)="deactivate(t.id)" *ngIf="t.isActive">Deactivate</button>
              <button class="rounded-lg bg-success-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-success-600" (click)="reactivate(t.id)" *ngIf="!t.isActive">Reactivate</button>
            </td>
          </tr>
          <tr *ngIf="tenants.length === 0">
            <td colspan="6" class="py-8 text-center text-sm text-gray-400">No schools found. Click "+ Add School" to create one.</td>
          </tr>
        </tbody>
      </table>
    </div>
  `,
  styles: []
})
export class TenantListComponent implements OnInit {
  tenants: TenantDto[] = [];
  showForm = false;
  errorMessage = '';
  successMessage = '';
  creating = false;
  showPassword = false;
  countries = COUNTRY_CODES;

  schoolForm!: FormGroup;

  get selectedCountry(): CountryCode | undefined {
    const code = this.schoolForm?.get('countryCode')?.value;
    return code ? this.countries.find(c => c.code === code) : undefined;
  }

  get passwordStrength(): number {
    const pw = this.schoolForm?.get('adminPassword')?.value || '';
    let score = 0;
    if (pw.length >= 8) score += 25;
    if (/[A-Z]/.test(pw)) score += 25;
    if (/[0-9]/.test(pw)) score += 25;
    if (/[^A-Za-z0-9]/.test(pw)) score += 25;
    return score;
  }

  get passwordStrengthClass(): string {
    const s = this.passwordStrength;
    if (s <= 25) return 'weak';
    if (s <= 50) return 'fair';
    if (s <= 75) return 'good';
    return 'strong';
  }

  get passwordStrengthLabel(): string {
    const s = this.passwordStrength;
    if (s <= 25) return 'Weak';
    if (s <= 50) return 'Fair';
    if (s <= 75) return 'Good';
    return 'Strong';
  }

  constructor(private tenantService: TenantService, private fb: FormBuilder) {}

  ngOnInit(): void {
    this.initForm();
    this.load();
  }

  initForm(): void {
    this.schoolForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      code: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50), Validators.pattern(/^[a-z0-9]+(-[a-z0-9]+)*$/)]],
      email: ['', [Validators.email]],
      countryCode: [''],
      phoneNumber: ['', [this.phoneValidator.bind(this)]],
      adminEmail: ['', [Validators.required, Validators.email]],
      adminPassword: ['', [Validators.required, Validators.minLength(8), this.passwordStrengthValidator]],
      adminFirstName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      adminLastName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
    });

    // Re-validate phone when country changes
    this.schoolForm.get('countryCode')?.valueChanges.subscribe(() => {
      this.schoolForm.get('phoneNumber')?.updateValueAndValidity();
    });
  }

  phoneValidator(control: AbstractControl): ValidationErrors | null {
    const phone = control.value;
    if (!phone) return null; // phone is optional
    const countryCode = this.schoolForm?.get('countryCode')?.value;
    if (!countryCode) return null; // no country = skip validation (separate hint shown)
    const country = this.countries.find(c => c.code === countryCode);
    if (!country) return null;
    const digitsOnly = phone.replace(/[\s\-()]/g, '');
    return country.phonePattern.test(digitsOnly) ? null : { invalidPhone: true };
  }

  passwordStrengthValidator(control: AbstractControl): ValidationErrors | null {
    const pw = control.value;
    if (!pw) return null;
    if (!/[A-Z]/.test(pw)) return { passwordStrength: 'Must contain at least one uppercase letter.' };
    if (!/[a-z]/.test(pw)) return { passwordStrength: 'Must contain at least one lowercase letter.' };
    if (!/[0-9]/.test(pw)) return { passwordStrength: 'Must contain at least one number.' };
    if (!/[^A-Za-z0-9]/.test(pw)) return { passwordStrength: 'Must contain at least one special character (@, #, $, etc.).' };
    return null;
  }

  showError(field: string): boolean {
    const ctrl = this.schoolForm.get(field);
    return !!(ctrl && ctrl.invalid && (ctrl.dirty || ctrl.touched));
  }

  toggleForm(): void {
    this.showForm = !this.showForm;
    this.errorMessage = '';
    if (this.showForm) {
      this.initForm();
    }
  }

  load(): void {
    this.tenantService.getAll().subscribe({
      next: t => this.tenants = t,
      error: (err: HttpErrorResponse) => {
        this.errorMessage = this.extractError(err);
      }
    });
  }

  create(): void {
    if (this.schoolForm.invalid) {
      this.schoolForm.markAllAsTouched();
      return;
    }

    this.errorMessage = '';
    this.successMessage = '';
    this.creating = true;

    const v = this.schoolForm.value;
    const phone = v.phoneNumber
      ? (this.selectedCountry ? this.selectedCountry.dial + v.phoneNumber.replace(/[\s\-()]/g, '') : v.phoneNumber)
      : undefined;

    const payload = {
      name: v.name.trim(),
      code: v.code.trim(),
      email: v.email?.trim() || undefined,
      phone: phone || undefined,
      adminEmail: v.adminEmail.trim(),
      adminPassword: v.adminPassword,
      adminFirstName: v.adminFirstName.trim(),
      adminLastName: v.adminLastName.trim(),
    };

    this.tenantService.create(payload).subscribe({
      next: () => {
        this.showForm = false;
        this.creating = false;
        this.successMessage = 'School created successfully!';
        this.load();
        setTimeout(() => this.successMessage = '', 5000);
      },
      error: (err: HttpErrorResponse) => {
        this.creating = false;
        this.errorMessage = this.extractError(err);
      }
    });
  }

  deactivate(id: string): void {
    if (confirm('Deactivate this school?')) {
      this.errorMessage = '';
      this.tenantService.deactivate(id).subscribe({
        next: () => this.load(),
        error: (err: HttpErrorResponse) => {
          this.errorMessage = this.extractError(err);
        }
      });
    }
  }

  reactivate(id: string): void {
    if (confirm('Reactivate this school?')) {
      this.errorMessage = '';
      this.tenantService.reactivate(id).subscribe({
        next: () => this.load(),
        error: (err: HttpErrorResponse) => {
          this.errorMessage = this.extractError(err);
        }
      });
    }
  }

  private extractError(err: HttpErrorResponse): string {
    if (err.error?.error) return err.error.error;
    if (err.error?.message) return err.error.message;
    if (typeof err.error === 'string') return err.error;
    if (err.message) return err.message;
    return 'An unexpected error occurred. Please try again.';
  }
}
