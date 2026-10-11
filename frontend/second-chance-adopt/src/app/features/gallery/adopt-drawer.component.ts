import { ChangeDetectionStrategy, Component, ElementRef, computed, inject, input, output, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Dog } from '../../core/models/dog.model';
import { InquiryService } from '../../core/services/inquiry.service';
import { AgePipe } from '../../shared/dog-format.pipes';
import { IconComponent } from '../../shared/icon.component';
import { ModalDirective } from '../../shared/modal.directive';
import { onImageError } from '../../shared/placeholder';

type Field = 'fullName' | 'email' | 'phone' | 'message';
type SubmitState = 'idle' | 'submitting' | 'success' | 'error';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE = /^\+?[0-9\s\-()]{7,18}$/;

@Component({
  selector: 'app-adopt-drawer',
  standalone: true,
  imports: [ReactiveFormsModule, IconComponent, AgePipe, ModalDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './adopt-drawer.component.html',
})
export class AdoptDrawerComponent {
  readonly dog = input.required<Dog>();
  readonly closed = output<void>();

  private readonly inquiries = inject(InquiryService);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  protected readonly onImageError = onImageError;
  protected readonly maxMessage = 400;

  protected readonly state = signal<SubmitState>('idle');
  protected readonly submitted = signal(false);
  protected readonly sentTo = signal({ firstName: '', email: '' });

  protected readonly form = new FormGroup({
    fullName: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(2), Validators.maxLength(80)],
    }),
    email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.pattern(EMAIL)] }),
    phone: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.pattern(PHONE)] }),
    message: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(20), Validators.maxLength(this.maxMessage)],
    }),
  });

  private readonly messageValue = toSignal(this.form.controls.message.valueChanges, { initialValue: '' });
  protected readonly messageLength = computed(() => this.messageValue().length);

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
      case 'fullName':
        return c.hasError('required') ? 'Enter your full name.' : 'Enter at least 2 characters.';
      case 'email':
        return c.hasError('required') ? 'Enter your email address.' : 'Enter a valid email, like name@example.com.';
      case 'phone':
        return c.hasError('required')
          ? 'Enter a phone number we can reach you on.'
          : 'Enter a valid phone number, for example +254 712 345 678.';
      case 'message':
        if (c.hasError('required')) {
          return 'Tell us why you would like to adopt.';
        }
        return c.hasError('minlength')
          ? 'Write at least 20 characters so we can get to know you.'
          : `Keep your message under ${this.maxMessage} characters.`;
    }
  }

  protected submit(): void {
    this.submitted.set(true);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      setTimeout(() => this.host.nativeElement.querySelector<HTMLElement>('.is-invalid')?.focus());
      return;
    }

    const value = this.form.getRawValue();
    this.state.set('submitting');
    this.inquiries
      .submit({
        dogId: this.dog().id,
        dogName: this.dog().name,
        fullName: value.fullName.trim(),
        email: value.email.trim(),
        phone: value.phone.trim(),
        message: value.message.trim(),
      })
      .subscribe({
        next: () => {
          this.sentTo.set({ firstName: value.fullName.trim().split(/\s+/)[0], email: value.email.trim() });
          this.state.set('success');
        },
        error: () => this.state.set('error'),
      });
  }
}
