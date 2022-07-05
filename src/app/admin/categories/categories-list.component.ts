import {AfterViewInit, Component, OnInit} from '@angular/core';
import {APPCONFIG} from '../../config';
import {CategoryService} from '../../services/category.service';
import {AlertMessageService} from '../../shared/alerts/alert-message.service';
import swal from 'sweetalert2'

declare var $: any;

@Component({
    selector: 'app-categories-list',
    templateUrl: './categories-list.component.html'
})
export class CategoriesListComponent implements OnInit {
    test: Date = new Date();
    numbers: Array<number> = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];
    carouselConfig: any = {}
    categoryListGrouped: Array<any> = [];
    categories: Array<any>;
    appConfig: any;
    routes;
    loading = false;

    constructor(public _categoryService: CategoryService, private _alertMessageService: AlertMessageService) {
        this.appConfig = APPCONFIG;
        this.routes = this.appConfig.routes;
    }


    ngOnInit() {
        this.getCategoriesList();
    }

    deleteCategory(category) {
        swal.fire({
            buttonsStyling: false,
            focusConfirm: false,
            allowEnterKey: false,
            title: 'Eliminar Categoría',
            text: '¿Está seguro de querer eliminar la Categoría? Se eliminarán también sus Subcategorías',
            type: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Si, eliminar',
            cancelButtonText: 'Cancelar',
            confirmButtonClass: 'btn btn-warning mr-10',
            cancelButtonClass: 'btn btn-default'
        }).then(() => {
            this._categoryService.deleteCategory(category)
                .subscribe(
                    result => {
                        this.getCategoriesList();
                        this._alertMessageService.handleMessage('Categoría eliminada exitosamente', 'success');
                    }
                );
        })
            .catch(() => console.log('Eliminación cancelada'));
    }

    getCategoriesList() {
        this._categoryService.getCategories()
            .subscribe(response => {
                this.categories = response;
            });
    }
}
