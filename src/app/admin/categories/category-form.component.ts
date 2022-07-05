import {AfterViewInit, Component, EventEmitter, Input, OnInit, Output, ViewEncapsulation} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';

import {AlertMessageService} from '../../shared/alerts/alert-message.service';
import {Category} from '../../models/category.model';
import {AuthService} from '../../auth/auth.service';
import {CategoryService} from '../../services/category.service';
import {ActivatedRoute, Router} from '@angular/router';
import {APPCONFIG} from '../../config';


@Component({
    selector: 'app-category-form',
    templateUrl: './category-form.component.html'
})
export class CategoryFormComponent implements OnInit {
    myForm: FormGroup;
    category: Category;
    catId: string;
    categories: Array<any> = [];
    color = '#ffffff';
    icon: any;
    errorIcon: string;
    preview: any;
    pathIcon: string;
    iconChanged = false;

    @Output() onCancelar = new EventEmitter<any>();
    @Input() idUsuario: string = null;

    constructor(
        private _authService: AuthService,
        private _categoryService: CategoryService,
        private _alertMessageService: AlertMessageService,
        public activatedRoute: ActivatedRoute,
        public router: Router
    ) {}

    ngOnInit() {
        this.myForm = new FormGroup({
            name: new FormControl(null, Validators.required),
            description: new FormControl(null),
            icon: new FormControl(null),
            color: new FormControl(null),
            hasPrice: new FormControl(null),
            requiredImage: new FormControl(null),
            footerText: new FormControl(null),
            metaKeywords: new FormControl(null),
            metaDescription: new FormControl(null),
            metaTitle: new FormControl(null),
            parentId: new FormControl(null)

        });

        this._categoryService.getCategories()
            .subscribe(response => {
                this.categories = response;
            });

        this.activatedRoute
            .params
            .subscribe(params => {
                this.catId = params['catId'];
                (this.catId);
                if (this.catId) {
                    this._categoryService.getCategory(this.catId)
                        .subscribe(
                            (category: any) => {
                                this.category = category;
                                if (this.category.icon) {
                                    this.pathIcon = APPCONFIG.path_icons;
                                    const img = new Image();
                                    img.src = this.category.icon.pathCdn;
                                    this.preview = img;
                                    this.icon = true;
                                }
                                if (category.color) {
                                    this.color = category.color;
                                }

                            }
                        )
                }
            });
    }

    fileChange(event) {
        const reader = new FileReader();
        this.errorIcon = null;
        const fileList: FileList = event.target.files;
        if (fileList.length > 0) {
            const file: File = fileList[0];
            if (this.validType(file.type)) {
                this.icon = file;
                this.iconChanged = true;
                reader.readAsDataURL(file);
                reader.onload = () => {
                    const img = new Image();
                    img.src = reader.result as string;
                    this.preview = img;
                };

            } else {
                this.errorIcon = 'El tipo archivo seleccionado no está permitido'
            }
        }
    }

    validType(fileType) {
        return APPCONFIG.file_types.indexOf(fileType) !== -1;
    }

    removeIcon() {
        this.icon = null;
        this.errorIcon = null;
        this.iconChanged = true;
    }

    onSubmit() {
        let category;
        if (this.category) {
            category = this.category;
            const categoryUpdated = this.setFormValues(category);
            this._categoryService.updateCategory(categoryUpdated, this.icon, this.iconChanged)
                .subscribe(
                    (result: any) => {
                        this._alertMessageService.handleMessage('Se actualizó correctamente la Categoría', 'success');
                        this.category = null;
                        this.router.navigate(['admin/categories']);
                    }
                );
        } else {
            category = new Category();
            const categoryCreated = this.setFormValues(category);
            this._categoryService.createCategory(categoryCreated, this.icon)
                .subscribe(
                    (result: any) => {
                        this._alertMessageService.handleMessage('Se creó correctamente la Categoría', 'success');
                        this.router.navigate(['admin/categories']);
                    }
                );
        }
    }

    setFormValues(category: Category) {
        category.name = this.myForm.value.name;
        category.description = this.myForm.value.description;
        category.icon = this.myForm.value.icon;
        category.color = this.color;
        category.hasPrice = this.myForm.value.hasPrice;
        category.requiredImage = this.myForm.value.requiredImage;
        category.footerText = this.myForm.value.footerText;
        category.metaKeywords = this.myForm.value.metaKeywords;
        category.metaDescription = this.myForm.value.metaDescription;
        category.metaTitle = this.myForm.value.metaTitle;
        category.parentId = this.myForm.value.parentId;
        return category;
    }
}
