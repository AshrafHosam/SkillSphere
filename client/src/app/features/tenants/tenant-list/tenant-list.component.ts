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
    <div class="page-header">
      <h1>Schools (Tenants)</h1>
      <button class="btn-primary" (click)="toggleForm()">{{ showForm ? 'Cancel' : '+ Add School' }}</button>
    </div>

    <div class="alert alert-danger" *ngIf="errorMessage">
      <span class="alert-icon">⚠</span>
      <span class="alert-text">{{ errorMessage }}</span>
      <button class="alert-close" (click)="errorMessage = ''">✕</button>
    </div>

    <div class="alert alert-success" *ngIf="successMessage">
      <span class="alert-icon">✓</span>
      <span class="alert-text">{{ successMessage }}</span>
      <button class="alert-close" (click)="successMessage = ''">✕</button>
    </div>

    <div class="card form-card" *ngIf="showForm">
      <h3>Onboard New School</h3>
      <form [formGroup]="schoolForm" (ngSubmit)="create()">
        <!-- School Info -->
        <div class="form-section-title">School Information</div>
        <div class="form-row">
          <div class="form-group">
            <label>School Name <span class="required">*</span></label>
            <input formControlName="name" placeholder="e.g. Al Abtal Academy" />
            <div class="field-error" *ngIf="showError('name')">
              <span *ngIf="schoolForm.get('name')?.errors?.['required']">School name is required.</span>
              <span *ngIf="schoolForm.get('name')?.errors?.['minlength']">Must be at least 2 characters.</span>
              <span *ngIf="schoolForm.get('name')?.errors?.['maxlength']">Must be under 100 characters.</span>
            </div>
          </div>
          <div class="form-group">
            <label>Subdomain / Code <span class="required">*</span></label>
            <input formControlName="code" placeholder="e.g. al-abtal" />
            <div class="field-hint" *ngIf="!showError('code')">Lowercase letters, numbers, and hyphens only.</div>
            <div class="field-error" *ngIf="showError('code')">
              <span *ngIf="schoolForm.get('code')?.errors?.['required']">Subdomain code is required.</span>
              <span *ngIf="schoolForm.get('code')?.errors?.['minlength']">Must be at least 3 characters.</span>
              <span *ngIf="schoolForm.get('code')?.errors?.['maxlength']">Must be under 50 characters.</span>
              <span *ngIf="schoolForm.get('code')?.errors?.['pattern']">Only lowercase letters, numbers, and hyphens allowed.</span>
            </div>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Contact Email</label>
            <input formControlName="email" type="email" placeholder="e.g. info&#64;school.com" />
            <div class="field-error" *ngIf="showError('email')">
              <span *ngIf="schoolForm.get('email')?.errors?.['email']">Enter a valid email address.</span>
            </div>
          </div>
          <div class="form-group">
            <label>Phone</label>
            <div class="phone-input-group">
              <select formControlName="countryCode" class="country-select">
                <option value="">Country</option>
                <option *ngFor="let c of countries" [value]="c.code">{{ c.name }} ({{ c.dial }})</option>
              </select>
              <input formControlName="phoneNumber" class="phone-number-input"
                     [placeholder]="selectedCountry?.phonePlaceholder || 'Phone number'" />
            </div>
            <div class="field-error" *ngIf="showError('phoneNumber')">
              <span *ngIf="schoolForm.get('phoneNumber')?.errors?.['invalidPhone']">
                Invalid phone number for {{ selectedCountry?.name || 'selected country' }}.
              </span>
            </div>
            <div class="field-error" *ngIf="schoolForm.get('phoneNumber')?.value && !schoolForm.get('countryCode')?.value">
              <span>Please select a country first.</span>
            </div>
          </div>
        </div>

        <!-- Admin Account -->
        <div class="form-section-title">Admin Account</div>
        <div class="form-row">
          <div class="form-group">
            <label>Admin Email <span class="required">*</span></label>
            <input formControlName="adminEmail" type="email" placeholder="e.g. admin&#64;school.com" />
            <div class="field-error" *ngIf="showError('adminEmail')">
              <span *ngIf="schoolForm.get('adminEmail')?.errors?.['required']">Admin email is required.</span>
              <span *ngIf="schoolForm.get('adminEmail')?.errors?.['email']">Enter a valid email address.</span>
            </div>
          </div>
          <div class="form-group">
            <label>Admin Password <span class="required">*</span></label>
            <div class="password-wrapper">
              <input formControlName="adminPassword" [type]="showPassword ? 'text' : 'password'" placeholder="Min 8 chars, uppercase, number, symbol" />
              <button type="button" class="toggle-password" (click)="showPassword = !showPassword">
                {{ showPassword ? '🙈' : '👁' }}
              </button>
            </div>
            <div class="password-strength" *ngIf="schoolForm.get('adminPassword')?.value">
              <div class="strength-bar">
                <div class="strength-fill" [style.width.%]="passwordStrength" [class]="passwordStrengthClass"></div>
              </div>
              <span class="strength-label" [class]="passwordStrengthClass">{{ passwordStrengthLabel }}</span>
            </div>
            <div class="field-error" *ngIf="showError('adminPassword')">
              <span *ngIf="schoolForm.get('adminPassword')?.errors?.['required']">Password is required.</span>
              <span *ngIf="schoolForm.get('adminPassword')?.errors?.['minlength']">Must be at least 8 characters.</span>
              <span *ngIf="schoolForm.get('adminPassword')?.errors?.['passwordStrength']">
                {{ schoolForm.get('adminPassword')?.errors?.['passwordStrength'] }}
              </span>
            </div>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Admin First Name <span class="required">*</span></label>
            <input formControlName="adminFirstName" placeholder="e.g. Ahmed" />
            <div class="field-error" *ngIf="showError('adminFirstName')">
              <span *ngIf="schoolForm.get('adminFirstName')?.errors?.['required']">First name is required.</span>
              <span *ngIf="schoolForm.get('adminFirstName')?.errors?.['minlength']">Must be at least 2 characters.</span>
              <span *ngIf="schoolForm.get('adminFirstName')?.errors?.['maxlength']">Must be under 50 characters.</span>
            </div>
          </div>
          <div class="form-group">
            <label>Admin Last Name <span class="required">*</span></label>
            <input formControlName="adminLastName" placeholder="e.g. Fahmy" />
            <div class="field-error" *ngIf="showError('adminLastName')">
              <span *ngIf="schoolForm.get('adminLastName')?.errors?.['required']">Last name is required.</span>
              <span *ngIf="schoolForm.get('adminLastName')?.errors?.['minlength']">Must be at least 2 characters.</span>
              <span *ngIf="schoolForm.get('adminLastName')?.errors?.['maxlength']">Must be under 50 characters.</span>
            </div>
          </div>
        </div>

        <button type="submit" class="btn-primary btn-submit" [disabled]="creating || schoolForm.invalid">
          {{ creating ? 'Creating...' : 'Create School' }}
        </button>
      </form>
    </div>

    <div class="card">
      <table class="data-table">
        <thead><tr><th>School Name</th><th>Subdomain</th><th>Email</th><th>Phone</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody>
          <tr *ngFor="let t of tenants">
            <td>{{ t.name }}</td>
            <td>{{ t.code }}</td>
            <td>{{ t.email || '—' }}</td>
            <td>{{ t.phone || '—' }}</td>
            <td><span [class]="t.isActive ? 'badge-active' : 'badge-inactive'">{{ t.isActive ? 'Active' : 'Inactive' }}</span></td>
            <td>
              <button class="btn-sm btn-danger" (click)="deactivate(t.id)" *ngIf="t.isActive">Deactivate</button>
              <button class="btn-sm btn-success" (click)="reactivate(t.id)" *ngIf="!t.isActive">Reactivate</button>
            </td>
          </tr>
          <tr *ngIf="tenants.length === 0">
            <td colspan="6" class="empty-row">No schools found. Click "+ Add School" to create one.</td>
          </tr>
        </tbody>
      </table>
    </div>
  `,
  styles: [`
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
    .page-header h1 { margin: 0; }
    .btn-primary { padding: 0.5rem 1rem; background: #0f172a; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 0.875rem; }
    .btn-primary:hover:not(:disabled) { background: #1e293b; }
    .btn-submit { margin-top: 0.5rem; padding: 0.625rem 1.5rem; }
    .btn-sm { padding: 0.25rem 0.75rem; border: none; border-radius: 4px; cursor: pointer; font-size: 0.8rem; }
    .btn-danger { background: #ef4444; color: white; }
    .btn-danger:hover { background: #dc2626; }
    .btn-success { background: #22c55e; color: white; }
    .btn-success:hover { background: #16a34a; }
    .card { background: white; padding: 1.5rem; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); margin-bottom: 1rem; }
    .form-card { margin-bottom: 1.5rem; }
    .form-section-title { font-weight: 700; font-size: 0.8rem; text-transform: uppercase; color: #64748b; letter-spacing: 0.05em; margin-bottom: 0.75rem; margin-top: 0.5rem; padding-bottom: 0.4rem; border-bottom: 1px solid #f1f5f9; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    .form-group { margin-bottom: 1rem; }
    .form-group label { display: block; margin-bottom: 0.25rem; font-weight: 600; font-size: 0.875rem; color: #334155; }
    .required { color: #ef4444; }
    .form-group input, .form-group select { width: 100%; padding: 0.5rem 0.625rem; border: 1px solid #e2e8f0; border-radius: 6px; box-sizing: border-box; font-size: 0.875rem; transition: border-color 0.15s, box-shadow 0.15s; background: white; }
    .form-group input:focus, .form-group select:focus { outline: none; border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,0.15); }
    .form-group input.ng-invalid.ng-touched, .form-group select.ng-invalid.ng-touched { border-color: #ef4444; }
    .form-group input.ng-valid.ng-touched { border-color: #22c55e; }
    .field-error { color: #ef4444; font-size: 0.75rem; margin-top: 0.25rem; }
    .field-hint { color: #94a3b8; font-size: 0.75rem; margin-top: 0.25rem; }

    /* Phone input */
    .phone-input-group { display: flex; gap: 0.5rem; }
    .country-select { flex: 0 0 45%; min-width: 0; padding: 0.5rem 0.375rem; font-size: 0.8rem; }
    .phone-number-input { flex: 1; min-width: 0; }

    /* Password */
    .password-wrapper { position: relative; display: flex; align-items: center; }
    .password-wrapper input { padding-right: 2.5rem; }
    .toggle-password { position: absolute; right: 0.5rem; background: none; border: none; cursor: pointer; font-size: 1rem; padding: 0.25rem; line-height: 1; }
    .password-strength { display: flex; align-items: center; gap: 0.5rem; margin-top: 0.35rem; }
    .strength-bar { flex: 1; height: 4px; background: #e2e8f0; border-radius: 2px; overflow: hidden; }
    .strength-fill { height: 100%; border-radius: 2px; transition: width 0.3s, background 0.3s; }
    .strength-fill.weak { background: #ef4444; }
    .strength-fill.fair { background: #f59e0b; }
    .strength-fill.good { background: #3b82f6; }
    .strength-fill.strong { background: #22c55e; }
    .strength-label { font-size: 0.7rem; font-weight: 600; text-transform: uppercase; }
    .strength-label.weak { color: #ef4444; }
    .strength-label.fair { color: #f59e0b; }
    .strength-label.good { color: #3b82f6; }
    .strength-label.strong { color: #22c55e; }

    /* Table */
    .data-table { width: 100%; border-collapse: collapse; }
    .data-table th, .data-table td { padding: 0.75rem; text-align: left; border-bottom: 1px solid #e2e8f0; }
    .data-table th { font-weight: 600; color: #64748b; font-size: 0.8rem; text-transform: uppercase; }
    .empty-row { text-align: center; color: #94a3b8; padding: 2rem !important; }
    .badge-active { background: #dcfce7; color: #166534; padding: 0.2rem 0.5rem; border-radius: 12px; font-size: 0.75rem; }
    .badge-inactive { background: #fef2f2; color: #991b1b; padding: 0.2rem 0.5rem; border-radius: 12px; font-size: 0.75rem; }

    /* Alerts */
    .alert { display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem 1rem; border-radius: 8px; margin-bottom: 1rem; font-size: 0.9rem; }
    .alert-danger { background: #fef2f2; color: #991b1b; border: 1px solid #fecaca; }
    .alert-success { background: #dcfce7; color: #166534; border: 1px solid #bbf7d0; }
    .alert-icon { font-size: 1.1rem; flex-shrink: 0; }
    .alert-text { flex: 1; }
    .alert-close { background: none; border: none; cursor: pointer; font-size: 1rem; color: inherit; padding: 0 0.25rem; opacity: 0.7; }
    .alert-close:hover { opacity: 1; }
    .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
  `]
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
