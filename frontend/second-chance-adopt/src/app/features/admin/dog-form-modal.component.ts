import { ChangeDetectionStrategy, Component, DestroyRef, ElementRef, OnInit, computed, inject, input, output, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { DOG_GENDERS, DOG_SIZES, DOG_STATUSES, Dog, DogGender, DogInput, DogSize, DogStatus } from '../../core/models/dog.model';
import { DogService } from '../../core/services/dog.service';
import { ToastService } from '../../core/services/toast.service';
import { IconComponent } from '../../shared/icon.component';
import { ModalDirective } from '../../shared/modal.directive';
import { onImageError } from '../../shared/placeholder';

type Field = 'name' | 'breed' | 'ageValue' | 'imageUrl' | 'description';
type AgeUnit = 'months' | 'years';

const IMAGE_URL = /^https?:\/\/\S+\.\S+/i;

/** Age limits depend on the unit, so the check reads the sibling control. */
function ageRange(control: AbstractControl): ValidationErrors | null {
  const value = control.value as number | null;
  if (value === null || value === undefined || (value as unknown) === '') {
    return null;
  }
  const unit = control.parent?.get('ageUnit')?.value as AgeUnit | undefined;
  const max = unit === 'years' ? 25 : 300;
  return value > max ? { max: { max, unit: unit ?? 'months' } } : null;
}

@Component({
  selector: 'app-dog-form-modal',
  standalone: true,
  imports: [ReactiveFormsModule, IconComponent, ModalDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './dog-form-modal.component.html',
})
export class DogFormModalComponent implements OnInit {
  /** Pass a dog to edit it, or null to add a new one. */
  readonly dog = input<Dog | null>(null);
  readonly closed = output<void>();

  private readonly dogs = inject(DogService);
  private readonly toast = inject(ToastService);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly onImageError = onImageError;
  protected readonly statuses: DogStatus[] = DOG_STATUSES;
  protected readonly sizes: DogSize[] = DOG_SIZES;
  protected readonly genders: DogGender[] = DOG_GENDERS;

  protected readonly submitted = signal(false);
  protected readonly saving = signal(false);

  protected readonly form = new FormGroup({
    name: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(40)] }),
    breed: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(60)] }),
    ageValue: new FormControl<number | null>(null, [Validators.required, Validators.min(1), ageRange]),
    ageUnit: new FormControl<AgeUnit>('years', { nonNullable: true }),
    gender: new FormControl<DogGender>('Male', { nonNullable: true }),
    size: new FormControl<DogSize>('Medium', { nonNullable: true }),
    status: new FormControl<DogStatus>('Available', { nonNullable: true }),
    imageUrl: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.pattern(IMAGE_URL)] }),
    description: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(20), Validators.maxLength(500)],
    }),
    vaccinated: new FormControl(true, { nonNullable: true }),
    neutered: new FormControl(false, { nonNullable: true }),
  });

  private readonly imageValue = toSignal(this.form.controls.imageUrl.valueChanges, { initialValue: '' });
  protected readonly previewUrl = computed(() => {
    const url = this.imageValue().trim();
    return IMAGE_URL.test(url) ? url : '';
  });

  private readonly descValue = toSignal(this.form.controls.description.valueChanges, { initialValue: '' });
  protected readonly descLength = computed(() => this.descValue().length);

  constructor() {
    // Changing the unit changes the allowed range, so re-check the age.
    this.form.controls.ageUnit.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.form.controls.ageValue.updateValueAndValidity());
  }

  ngOnInit(): void {
    const dog = this.dog();
    if (!dog) {
      return;
    }
    const wholeYears = dog.ageMonths >= 12 && dog.ageMonths % 12 === 0;
    this.form.patchValue({
      name: dog.name,
      breed: dog.breed,
      ageValue: wholeYears ? dog.ageMonths / 12 : dog.ageMonths,
      ageUnit: wholeYears ? 'years' : 'months',
      gender: dog.gender,
      size: dog.size,
      status: dog.status,
      imageUrl: dog.imageUrl,
      description: dog.description,
      vaccinated: dog.vaccinated,
      neutered: dog.neutered,
    });
  }

  protected isInvalid(field: Field): boolean {
    const c = this.form.controls[field];
    return c.invalid && (c.touched || this.submitted());
  }

  protected isValid(field: Field): boolean {
    const c = this.form.controls[field];
    return c.valid && c.dirty;
  }

  protected errorText(field: Field): string {
    const c = this.form.controls[field];
    switch (field) {
      case 'name':
        return c.hasError('required') ? 'Enter the dog’s name.' : 'Keep the name under 40 characters.';
      case 'breed':
        return c.hasError('required') ? 'Enter a breed, or "Mixed breed".' : 'Keep the breed under 60 characters.';
      case 'ageValue': {
        if (c.hasError('required')) {
          return 'Enter an age.';
        }
        if (c.hasError('min')) {
          return 'Age must be at least 1.';
        }
        const max = c.getError('max') as { max: number; unit: string };
        return `Age can’t be more than ${max.max} ${max.unit}.`;
      }
      case 'imageUrl':
        return c.hasError('required')
          ? 'Add a link to a photo.'
          : 'Enter the full link, starting with https://';
      case 'description':
        return c.hasError('required')
          ? 'Add a short description for adopters.'
          : c.hasError('minlength')
            ? 'Write at least 20 characters.'
            : 'Keep the description under 500 characters.';
    }
  }

  protected save(): void {
    this.submitted.set(true);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      setTimeout(() => this.host.nativeElement.querySelector<HTMLElement>('.is-invalid')?.focus());
      return;
    }

    const v = this.form.getRawValue();
    const age = Math.round(v.ageValue ?? 0);
    const input: DogInput = {
      name: v.name.trim(),
      breed: v.breed.trim(),
      ageMonths: v.ageUnit === 'years' ? age * 12 : age,
      gender: v.gender,
      size: v.size,
      status: v.status,
      imageUrl: v.imageUrl.trim(),
      description: v.description.trim(),
      vaccinated: v.vaccinated,
      neutered: v.neutered,
    };

    const editing = this.dog();
    this.saving.set(true);
    const request$ = editing ? this.dogs.update(editing.id, input) : this.dogs.add(input);
    request$.subscribe({
      next: (saved) => {
        this.toast.show(editing ? `Saved changes to ${saved.name}` : `Added ${saved.name} to the public list`);
        this.closed.emit();
      },
      error: () => {
        this.saving.set(false);
        this.toast.show('Couldn’t save the dog. Try again.', 'error');
      },
    });
  }
}
