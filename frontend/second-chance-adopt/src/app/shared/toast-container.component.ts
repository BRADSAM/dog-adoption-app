import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ToastService } from '../core/services/toast.service';
import { IconComponent } from './icon.component';

@Component({
  selector: 'app-toasts',
  standalone: true,
  imports: [IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="pointer-events-none fixed inset-x-4 bottom-4 z-[70] flex flex-col items-center gap-3 sm:inset-x-auto sm:right-6 sm:bottom-6 sm:items-end"
      aria-live="polite"
      aria-atomic="false"
    >
      @for (toast of toasts.toasts(); track toast.id) {
        <div
          class="glass-strong animate-pop pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-2xl py-3 pl-3.5 pr-2"
          role="status"
        >
          <span
            class="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-white"
            [class.bg-emerald-500]="toast.kind === 'success'"
            [class.bg-rose-500]="toast.kind === 'error'"
            [class.bg-indigo-500]="toast.kind === 'info'"
          >
            <app-icon [name]="toast.kind === 'error' ? 'alert-circle' : 'check'" [size]="14" [stroke]="2.5" />
          </span>
          <p class="flex-1 pt-0.5 text-sm font-medium leading-snug">{{ toast.message }}</p>
          <button type="button" class="icon-btn !h-7 !w-7" (click)="toasts.dismiss(toast.id)" aria-label="Dismiss message">
            <app-icon name="x" [size]="14" />
          </button>
        </div>
      }
    </div>
  `,
})
export class ToastContainerComponent {
  protected readonly toasts = inject(ToastService);
}
