import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { InquiryService } from '../core/services/inquiry.service';
import { ThemeService } from '../core/services/theme.service';
import { IconComponent } from './icon.component';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './navbar.component.html',
})
export class NavbarComponent {
  protected readonly themeService = inject(ThemeService);
  private readonly inquiries = inject(InquiryService);

  protected readonly newRequests = toSignal(this.inquiries.newCount$, { initialValue: 0 });
}
