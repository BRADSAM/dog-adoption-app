import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { IconComponent } from './shared/icon.component';
import { NavbarComponent } from './shared/navbar.component';
import { ToastContainerComponent } from './shared/toast-container.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, ToastContainerComponent, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <a
      href="#main"
      class="sr-only z-[80] rounded-xl bg-white px-4 py-2 font-semibold text-slate-900 focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
    >
      Skip to content
    </a>

    <app-navbar />

    <main id="main" tabindex="-1">
      <router-outlet />
    </main>

    <footer class="mt-24 border-t" style="border-color: var(--glass-border)">
      <div
        class="mx-auto flex max-w-shell flex-col gap-6 px-4 py-10 text-sm text-muted sm:px-6 md:flex-row md:items-center md:justify-between"
      >
        <div class="flex items-center gap-3">
          <app-icon name="paw" [size]="20" />
          <p class="max-w-md">
            Second Chance is run by the City Veterinary Office. Every dog is health-checked by our veterinary team
            before it is listed.
          </p>
        </div>
        <div class="flex flex-col gap-1.5 md:items-end">
          <p class="flex items-center gap-2"><app-icon name="map-pin" [size]="16" /> City Veterinary Office, 12 Council Road</p>
          <p class="flex items-center gap-2"><app-icon name="clock" [size]="16" /> Open Monday to Saturday, 8:00 to 17:00</p>
        </div>
      </div>
    </footer>

    <app-toasts />
  `,
})
export class AppComponent {}
