import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Dog } from '../../core/models/dog.model';
import { DogService } from '../../core/services/dog.service';
import { AgePipe, DaysWaitingPipe } from '../../shared/dog-format.pipes';
import { IconComponent, IconName } from '../../shared/icon.component';
import { onImageError } from '../../shared/placeholder';
import { AdoptDrawerComponent } from './adopt-drawer.component';
import { DogCardComponent } from './dog-card.component';

type FilterId = 'all' | 'puppies' | 'adult' | 'small' | 'large';
type SortId = 'longest' | 'youngest' | 'name';

interface FilterDef {
  id: FilterId;
  label: string;
  icon: IconName;
  test: (dog: Dog) => boolean;
}

@Component({
  selector: 'app-gallery',
  standalone: true,
  imports: [IconComponent, DogCardComponent, AdoptDrawerComponent, AgePipe, DaysWaitingPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './gallery.component.html',
})
export class GalleryComponent {
  private readonly dogService = inject(DogService);

  protected readonly onImageError = onImageError;

  protected readonly filters: FilterDef[] = [
    { id: 'all', label: 'All', icon: 'paw', test: () => true },
    { id: 'puppies', label: 'Puppies', icon: 'sparkles', test: (d) => d.ageMonths < 12 },
    { id: 'adult', label: 'Adult', icon: 'dog', test: (d) => d.ageMonths >= 12 },
    { id: 'small', label: 'Small', icon: 'minimize', test: (d) => d.size === 'Small' },
    { id: 'large', label: 'Large', icon: 'maximize', test: (d) => d.size === 'Large' },
  ];

  protected readonly sorts: { id: SortId; label: string }[] = [
    { id: 'longest', label: 'Waiting longest' },
    { id: 'youngest', label: 'Youngest first' },
    { id: 'name', label: 'Name A to Z' },
  ];

  protected readonly query = signal('');
  protected readonly filter = signal<FilterId>('all');
  protected readonly sort = signal<SortId>('longest');
  protected readonly selected = signal<Dog | null>(null);

  protected readonly loading = toSignal(this.dogService.loading$, { initialValue: true });
  private readonly allDogs = toSignal(this.dogService.dogs$, { initialValue: [] as Dog[] });

  /** Adopted dogs leave the public list. */
  private readonly listed = computed(() => this.allDogs().filter((d) => d.status !== 'Adopted'));

  protected readonly availableCount = computed(() => this.listed().filter((d) => d.status === 'Available').length);

  protected readonly counts = computed(() => {
    const list = this.listed();
    return Object.fromEntries(this.filters.map((f) => [f.id, list.filter(f.test).length])) as Record<FilterId, number>;
  });

  protected readonly featured = computed(
    () =>
      this.listed()
        .filter((d) => d.status === 'Available')
        .sort((a, b) => a.arrivedOn.localeCompare(b.arrivedOn))[0] ?? null,
  );

  protected readonly visible = computed(() => {
    const q = this.query().trim().toLowerCase();
    const active = this.filters.find((f) => f.id === this.filter()) ?? this.filters[0];
    const list = this.listed().filter(
      (d) => active.test(d) && (!q || d.name.toLowerCase().includes(q) || d.breed.toLowerCase().includes(q)),
    );
    switch (this.sort()) {
      case 'youngest':
        return list.sort((a, b) => a.ageMonths - b.ageMonths);
      case 'name':
        return list.sort((a, b) => a.name.localeCompare(b.name));
      default:
        return list.sort((a, b) => a.arrivedOn.localeCompare(b.arrivedOn));
    }
  });

  protected readonly hasActiveFilters = computed(() => this.query().trim() !== '' || this.filter() !== 'all');

  protected onSearch(event: Event): void {
    this.query.set((event.target as HTMLInputElement).value);
  }

  protected onSort(event: Event): void {
    this.sort.set((event.target as HTMLSelectElement).value as SortId);
  }

  protected clearFilters(): void {
    this.query.set('');
    this.filter.set('all');
  }

  protected select(dog: Dog): void {
    this.selected.set(dog);
  }

  protected scrollToResults(event?: Event): void {
    event?.preventDefault();
    document.getElementById('results')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}
