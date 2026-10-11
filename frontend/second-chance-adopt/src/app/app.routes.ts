import { Routes } from '@angular/router';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    title: 'Second Chance | Adopt a dog from the City Veterinary Office',
    loadComponent: () => import('./features/gallery/gallery.component').then((m) => m.GalleryComponent),
  },
  {
    path: 'admin',
    title: 'Staff dashboard | Second Chance',
    canActivate: [adminGuard],
    loadComponent: () => import('./features/admin/admin.component').then((m) => m.AdminComponent),
  },
  { path: '**', redirectTo: '' },
];
