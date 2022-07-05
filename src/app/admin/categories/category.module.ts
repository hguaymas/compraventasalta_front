import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {CategoryService} from '../../services/category.service';
import {CategoriesListComponent} from './categories-list.component';
import {CategoryFormComponent} from './category-form.component';
import {RouterModule} from '@angular/router';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import {ColorPickerModule} from 'ngx-color-picker';
import { SharedModule, TableModule } from 'primeng';

declare var $: any;

export const routes = [
    { path: '', component: CategoriesListComponent},
    { path: 'new', component: CategoryFormComponent},
    { path: 'edit/:catId', component: CategoryFormComponent}
];

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        RouterModule.forChild(routes),
        TableModule,
        SharedModule,
        NgbTooltipModule,
        ColorPickerModule
    ],
    declarations: [
        CategoriesListComponent,
        CategoryFormComponent
    ],
    providers: [
        CategoryService
    ]
})

export class CategoryModule {}
