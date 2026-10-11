# Second Chance: City Veterinary Office dog adoption (Angular front end)

Angular 18 standalone components, Tailwind CSS 3, no UI library. Works out of the box on mock data, then swaps to the Spring Boot API without touching the components.

## Run it

```bash
npm install
npm start          # http://localhost:4200
npm run build      # production build in dist/second-chance-adopt
```

Needs Node 18.19+ (20 or 22 recommended).

## What's in it

| Route | View |
| --- | --- |
| `/` | Public gallery: hero with search and filter pills, dog grid, adoption drawer |
| `/admin` | Staff dashboard: stats, dogs table (edit, delete, change status), adoption requests, add/edit modal |

Also included: light and dark themes (toggle in the header, saved between visits), loading skeletons, empty states, toasts, keyboard focus trapping in drawers and modals, Escape to close, reduced-motion support.

## Structure

```
src/app
  app.config.ts / app.routes.ts      providers, lazy routes
  core/
    models/                          Dog, AdoptionInquiry
    services/dog.service.ts          BehaviorSubject store + localStorage
    services/inquiry.service.ts      adoption requests
    services/toast|theme.service.ts
    guards/admin.guard.ts            placeholder, currently allows everyone
    data/mock-dogs.ts                seed data
  shared/                            icon, navbar, toasts, modal directive, pipes
  features/
    gallery/                         gallery, dog-card, adopt-drawer
    admin/                           admin, dog-form-modal
src/styles.css                       design tokens, glass, buttons, fields
tailwind.config.js                   theme colours as CSS variables
```

## Connect the Spring Boot backend

`DogService` and `InquiryService` are the only files that know where data lives. Keep the method signatures and replace the bodies with `HttpClient` calls (add `provideHttpClient()` in `app.config.ts`):

| Method | Endpoint |
| --- | --- |
| load dogs | `GET /api/dogs` |
| `add` | `POST /api/dogs` |
| `update`, `setStatus` | `PUT /api/dogs/{id}` |
| `remove` | `DELETE /api/dogs/{id}` |
| `InquiryService.submit` | `POST /api/inquiries` |
| `InquiryService.setStatus` | `PATCH /api/inquiries/{id}` |

Before going live:

- **Authentication.** `adminGuard` currently returns `true`. Implement login in Spring Security, make the guard check it, and enforce the same rule on the API. A client-side guard alone does not protect data.
- **Photos.** Mock dogs use `placedog.net`. Photos that fail to load fall back to a paw placeholder, so nothing breaks, but you'll want real images.
- **Copy.** The office address, opening hours, "2 working days" reply time and the sample dogs and requests are placeholders. Search for them and replace.
- **Brand colours.** Change the gradient in `src/styles.css` (`--brand-gradient`, `--coral-gradient`) and the mesh colours (`--mesh-1` to `--mesh-4`).
