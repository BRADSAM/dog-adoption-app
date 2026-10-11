import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { DOG_STATUSES, Dog, DogStatus } from '../../core/models/dog.model';
import { AdoptionInquiry, INQUIRY_STATUSES, InquiryStatus } from '../../core/models/inquiry.model';
import { DogService } from '../../core/services/dog.service';
import { InquiryService } from '../../core/services/inquiry.service';
import { ToastService } from '../../core/services/toast.service';
import { AgePipe } from '../../shared/dog-format.pipes';
import { IconComponent } from '../../shared/icon.component';
import { ModalDirective } from '../../shared/modal.directive';
import { onImageError } from '../../shared/placeholder';
import { DogFormModalComponent } from './dog-form-modal.component';

type Tab = 'dogs' | 'requests';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [DatePipe, IconComponent, AgePipe, ModalDirective, DogFormModalComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './admin.component.html',
})
export class AdminComponent {
  private readonly dogService = inject(DogService);
  private readonly inquiryService = inject(InquiryService);
  private readonly toast = inject(ToastService);

  protected readonly onImageError = onImageError;
  protected readonly dogStatuses: DogStatus[] = DOG_STATUSES;
  protected readonly inquiryStatuses: InquiryStatus[] = INQUIRY_STATUSES;

  protected readonly loading = toSignal(this.dogService.loading$, { initialValue: true });
  protected readonly dogs = toSignal(this.dogService.dogs$, { initialValue: [] as Dog[] });
  protected readonly inquiries = toSignal(this.inquiryService.inquiries$, { initialValue: [] as AdoptionInquiry[] });

  protected readonly tab = signal<Tab>('dogs');
  protected readonly query = signal('');
  protected readonly formOpen = signal(false);
  protected readonly editing = signal<Dog | null>(null);
  protected readonly deleting = signal<Dog | null>(null);
  protected readonly deleteBusy = signal(false);

  protected readonly stats = computed(() => {
    const dogs = this.dogs();
    return {
      total: dogs.length,
      available: dogs.filter((d) => d.status === 'Available').length,
      pending: dogs.filter((d) => d.status === 'Pending').length,
      newRequests: this.inquiries().filter((i) => i.status === 'New').length,
    };
  });

  protected readonly rows = computed(() => {
    const q = this.query().trim().toLowerCase();
    if (!q) {
      return this.dogs();
    }
    return this.dogs().filter((d) => d.name.toLowerCase().includes(q) || d.breed.toLowerCase().includes(q));
  });

  protected onSearch(event: Event): void {
    this.query.set((event.target as HTMLInputElement).value);
  }

  protected openAdd(): void {
    this.editing.set(null);
    this.formOpen.set(true);
  }

  protected openEdit(dog: Dog): void {
    this.editing.set(dog);
    this.formOpen.set(true);
  }

  protected closeForm(): void {
    this.formOpen.set(false);
    this.editing.set(null);
  }

  protected askDelete(dog: Dog): void {
    this.deleting.set(dog);
  }

  protected confirmDelete(): void {
    const dog = this.deleting();
    if (!dog) {
      return;
    }
    this.deleteBusy.set(true);
    this.dogService.remove(dog.id).subscribe({
      next: () => {
        this.toast.show(`Removed ${dog.name} from the list`);
        this.deleting.set(null);
        this.deleteBusy.set(false);
      },
      error: () => {
        this.toast.show(`Couldn’t remove ${dog.name}. Try again.`, 'error');
        this.deleteBusy.set(false);
      },
    });
  }

  protected changeDogStatus(dog: Dog, event: Event): void {
    const status = (event.target as HTMLSelectElement).value as DogStatus;
    this.dogService.setStatus(dog.id, status).subscribe({
      next: () => this.toast.show(`${dog.name} is now ${status}`),
      error: () => this.toast.show(`Couldn’t update ${dog.name}. Try again.`, 'error'),
    });
  }

  protected changeInquiryStatus(inquiry: AdoptionInquiry, event: Event): void {
    const status = (event.target as HTMLSelectElement).value as InquiryStatus;
    this.inquiryService.setStatus(inquiry.id, status);
    this.toast.show(`Marked ${inquiry.fullName}’s request as ${status}`);
  }
}
