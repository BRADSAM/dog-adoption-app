/** Shown when a dog photo fails to load, so cards never collapse or show a broken-image icon. */
export const PLACEHOLDER_IMG =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 520">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#312e81"/>
          <stop offset="1" stop-color="#6b21a8"/>
        </linearGradient>
      </defs>
      <rect width="640" height="520" fill="url(#g)"/>
      <g fill="#e0e7ff" fill-opacity=".55">
        <ellipse cx="320" cy="310" rx="76" ry="60"/>
        <circle cx="228" cy="232" r="26"/>
        <circle cx="288" cy="190" r="28"/>
        <circle cx="352" cy="190" r="28"/>
        <circle cx="412" cy="232" r="26"/>
      </g>
    </svg>`,
  );

/**
 * Use as (error)="onImageError($event)" on any dog photo.
 * The data attribute stops an infinite loop if the placeholder itself were to fail.
 */
export function onImageError(event: Event): void {
  const img = event.target as HTMLImageElement | null;
  if (!img || img.dataset['fallback']) {
    return;
  }
  img.dataset['fallback'] = '1';
  img.src = PLACEHOLDER_IMG;
}
