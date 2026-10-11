import { AfterViewInit, Directive, ElementRef, HostListener, OnDestroy, inject, output } from '@angular/core';

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Put on the dialog element of any modal or drawer. It:
 *  - moves focus inside (to [data-autofocus] if present, otherwise the first control)
 *  - keeps Tab and Shift+Tab inside the dialog
 *  - emits (dismiss) on Escape
 *  - locks page scroll while open and returns focus to the trigger when closed
 */
@Directive({ selector: '[appModal]', standalone: true })
export class ModalDirective implements AfterViewInit, OnDestroy {
  private static openCount = 0;

  readonly dismiss = output<void>();

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly previouslyFocused = document.activeElement as HTMLElement | null;

  ngAfterViewInit(): void {
    if (ModalDirective.openCount++ === 0) {
      document.body.style.overflow = 'hidden';
    }
    queueMicrotask(() => {
      const el = this.host.nativeElement;
      const target = el.querySelector<HTMLElement>('[data-autofocus]') ?? this.focusable()[0] ?? el;
      target.focus({ preventScroll: true });
    });
  }

  ngOnDestroy(): void {
    if (--ModalDirective.openCount <= 0) {
      ModalDirective.openCount = 0;
      document.body.style.overflow = '';
    }
    this.previouslyFocused?.focus?.({ preventScroll: true });
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.dismiss.emit();
  }

  @HostListener('keydown', ['$event'])
  onKeydown(event: KeyboardEvent): void {
    if (event.key !== 'Tab') {
      return;
    }
    const items = this.focusable();
    if (items.length === 0) {
      event.preventDefault();
      return;
    }
    const first = items[0];
    const last = items[items.length - 1];
    const active = document.activeElement;
    if (event.shiftKey && active === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
  }

  private focusable(): HTMLElement[] {
    return Array.from(this.host.nativeElement.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
      (el) => el.offsetParent !== null,
    );
  }
}
