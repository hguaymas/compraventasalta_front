import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AdminRoutes } from './admin.routing';
import {DashboardAdminComponent} from './dashboard/dashboard-admin.component';
import {LoginAdminComponent} from './login/login-admin.component';
import {AuthAdminGuard} from '../auth/auth-admin.guard';
import {FooterAdminModule} from './shared/footer/footer-admin.module';
import {HeaderAdminModule} from './shared/header/header-admin.module';
import {AdminLayoutComponent} from './layout/admin-layout.component';
import {CategoryModule} from './categories/category.module';
import {BreadcrumbsAdminComponent} from './shared/breadcrumbs/breadcrumbs-admin.component';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';


@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(AdminRoutes),
        FormsModule,
        ReactiveFormsModule,
        HeaderAdminModule,
        FooterAdminModule,
        CategoryModule,
        NgbTooltipModule
    ],
    declarations: [
        DashboardAdminComponent,
        LoginAdminComponent,
        AdminLayoutComponent,
        BreadcrumbsAdminComponent
    ],
    providers: [
        AuthAdminGuard
    ]
})

export class AdminModule {}
