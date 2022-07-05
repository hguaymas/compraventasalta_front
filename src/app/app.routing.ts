import { Routes } from '@angular/router';
import {AuthGuard} from './auth/auth.guard';

export const AppRoutes: Routes = [
    { path: 'admin', loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule)},
    { path: 'backend', loadChildren: () => import('./backend/backend.module').then(m => m.BackendModule), canActivate: [AuthGuard]},
    { path: '', redirectTo: '', pathMatch: 'full'},
    { path: '', loadChildren: () => import('./frontend/frontend.module').then(m => m.FrontendModule) },
    { path: '**', redirectTo: '404' }
];
