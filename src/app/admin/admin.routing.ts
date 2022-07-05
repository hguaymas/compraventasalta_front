import { Routes } from '@angular/router';

import { DashboardAdminComponent } from './dashboard/dashboard-admin.component';
import {LoginAdminComponent} from './login/login-admin.component';
import {AdminLayoutComponent} from './layout/admin-layout.component';
import {AuthAdminGuard} from '../auth/auth-admin.guard';

export const AdminRoutes: Routes = [
    {
        path: 'admin',
        component: AdminLayoutComponent,
        canActivate: [AuthAdminGuard],
        children: [
            { path: 'dashboard', component: DashboardAdminComponent},
            { path: 'categories', loadChildren: () => import('./categories/category.module').then(m => m.CategoryModule)}
        ]
    },
    { path: 'login', component: LoginAdminComponent}

];
