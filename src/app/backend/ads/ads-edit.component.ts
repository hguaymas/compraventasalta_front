import {AfterViewInit, Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {AbstractControl, FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {FacebookService, InitParams, LoginResponse} from 'ngx-facebook';
import {APPCONFIG} from '../../config';
import {AdService} from '../../services/ad.service';
import {CategoryService} from '../../services/category.service';
import {CityService} from '../../services/city.service';
import {UserService} from '../../services/user.service';
import {AlertMessageService} from '../../shared/alerts/alert-message.service';
import {AuthService} from '../../auth/auth.service';
import {User} from '../../models/user.model';
import {Ad} from '../../models/ad.model';
import {combineLatest} from 'rxjs';
import {BlockUI, NgBlockUI} from 'ng-block-ui';
import {ScrollToConfigOptions, ScrollToService} from '@nicky-lenaers/ngx-scroll-to';


declare var $: any;

@Component({
    selector: 'app-ads-edit',
    templateUrl: './ads-edit.component.html'

})
export class AdEditComponent implements OnInit, AfterViewInit {
    adId;
    ad;
    adImages: Array<any> = [];
    removedImages: Array<any> = [];
    categories: Array<any> = [];
    cities: Array<any> = [];
    adForm: FormGroup;
    phoneForm: FormGroup;
    cityForm: FormGroup;
    public config;
    pathImage;
    pathIcon;
    selectedCategory: any;
    selectedSubcategory: any;
    errorCategory = false;
    errorSubcategory = false;
    priceTypes = APPCONFIG.priceTypes;
    currencies = APPCONFIG.currencies;
    images: Array<any> = [];
    errorImage;
    loggedInUser: any;
    errorUserCity = false;
    scrollConfig: ScrollToConfigOptions = {
        target: 'tg-wrapper',
        duration: 4000,
        easing: 'easeOutElastic'
    };

    constructor(
        public _adService: AdService,
        private _categoryService: CategoryService,
        private _cityService: CityService,
        private _userService: UserService,
        private _alertMessageService: AlertMessageService,
        public _authService: AuthService,
        public router: Router,
        private fb: FacebookService,
        private formBuilder: FormBuilder,
        public activatedRoute: ActivatedRoute,
        private _scrollToService: ScrollToService
    ) {
        this.config = APPCONFIG;
        this.pathIcon = APPCONFIG.api_server + '/' + APPCONFIG.path_icons;
        const initParams: InitParams = {
            appId: APPCONFIG.facebook.appId,
            xfbml: true,
            version: 'v3.1'
        };

        fb.init(initParams);
    }

    ngOnInit() {
        const categories = this._categoryService.getCategories();
        const cities = this._cityService.getCities();
        const parameters = this.activatedRoute.params;
        const obsComb = combineLatest(categories, cities, parameters,
            (categoriesP, citiesP, paramsP) => ({categoriesP, citiesP, paramsP}));

        obsComb.subscribe(results => {
            const categories = results.categoriesP ? results.categoriesP : null;
            const cities = results.citiesP ? results.citiesP : null;
            const params = results.paramsP ? results.paramsP : null;

            this.categories = categories;
            this.cities = cities;
            this.adId = params['adId'];
            (this.adId);
            if (this.adId) {
                this._adService.getAdById(this.adId)
                    .subscribe(
                        (ad: any) => {
                            if (ad.status !== 'FINISHED' && ad.status !== 'DELETED') {
                                this.ad = ad;
                                for (const cat of this.categories) {
                                    if (cat._id === ad.category._id) {
                                        this.selectedCategory = cat;
                                    }
                                }
                                this.selectedSubcategory = ad.subcategory;
                                this.adImages = ad.images;
                            } else {
                                this._alertMessageService.handleMessage('No se puede editar un aviso finalizado o eliminado', 'error');
                                this.router.navigate(['/backend/mis-avisos']);
                            }
                        },
                        error => {
                            this.router.navigate(['/backend/mis-avisos']);
                            this._alertMessageService.handleMessage(error.error.message, 'error');
                        }
                    )
            }
        });

        this.adForm = new FormGroup({
            title: new FormControl(null, [Validators.required, Validators.minLength(10)]),
            content: new FormControl(null, [Validators.required, Validators.minLength(10)]),
            category: new FormControl(null, Validators.required),
            subcategory: new FormControl(null, Validators.required),
            price: new FormControl(null),
            currency: new FormControl(null),
            priceType: new FormControl(null),
            images: new FormControl(null)

        });
        this.phoneForm = new FormGroup({
            phone: new FormControl(null)
        });

        this.cityForm = new FormGroup({
            cityProfile: new FormControl(null)
        });

        if (this._authService.isLoggedIn() && this._authService.hasRol(APPCONFIG.roles.USER)) {
            this.loggedInUser = this._authService.getSessionUser();
        }
    }

    selectCategory(category) {
        this.selectedCategory = category;
    }

    selectSubcategory(subcategory) {
        this.selectedSubcategory = subcategory;
        $('#modal-categories').modal('toggle');
    }

    ngAfterViewInit() {
        // SCROLLBARS
        setTimeout(() => {
            if ($('.tg-verticalscrollbar').length > 0) {
                const _tg_verticalscrollbar = $('.tg-verticalscrollbar');
                _tg_verticalscrollbar.mCustomScrollbar({
                    axis: 'y',
                    scrollInertia: 250
                });
            }
            if ($('.tg-horizontalthemescrollbar').length > 0) {
                const _tg_horizontalthemescrollbar = $('.tg-horizontalthemescrollbar');
                _tg_horizontalthemescrollbar.mCustomScrollbar({
                    axis: 'x',
                    advanced: {autoExpandHorizontalScroll: true},
                });
            }
        }, 10);
    }

    validType(fileType) {
        return APPCONFIG.file_types.indexOf(fileType) !== -1;
    }

    removeImageNew(image) {
        const principal = image.principal;
        this.images.splice(this.images.indexOf(image), 1);
        const arrayMerge = this.adImages.concat(this.images);
        if (principal || arrayMerge.length === 1) {
            this.setPrincipal(arrayMerge[0]);
        }
    }

    removeImageOld(image) {
        const principal = image.principal;
        this.removedImages.push(image);
        this.adImages.splice(this.adImages.indexOf(image), 1);
        const arrayMerge = this.adImages.concat(this.images);
        if (principal || arrayMerge.length === 1) {
            this.setPrincipal(arrayMerge[0]);
        }
    }

    addImage(event) {
        const reader = new FileReader();
        this.errorImage = null;
        const fileList: FileList = event.target.files;
        if (fileList.length > 0) {
            const file: File = fileList[0];
            if (this.validType(file.type)) {
                reader.readAsDataURL(file);
                reader.onload = () => {
                    const img = new Image();
                    img.src = reader.result as string;
                    const image: any = {
                        preview: img,
                        file: file,
                        principal: false
                    };
                    const arrayMerge = this.adImages.concat(this.images);
                    if (arrayMerge.length === 0) {
                        image.principal = true;
                    }
                    this.images.push(image);
                };
            } else {
                this.errorImage = 'El tipo archivo seleccionado no está permitido'
            }
        }
    }

    setPrincipal(img) {
        const arrayMerge = this.adImages.concat(this.images);
        for (const image of arrayMerge) {
            image.principal = image === img;
        }
    }

    onSubmit() {
        if (this.selectedCategory && this.selectedSubcategory) {
            const arrayMerge = this.adImages.concat(this.images);
            if ((arrayMerge.length > 0 && this.selectedSubcategory.requiredImage) || !this.selectedSubcategory.requiredImage) {
                if (this.loggedInUser.city) {

                    this.errorCategory = !this.selectedCategory;
                    this.errorSubcategory = !this.selectedSubcategory;

                    const ad = new Ad();
                    ad.title = this.adForm.value.title;
                    ad.content = this.adForm.value.content;
                    ad.category = this.selectedCategory._id;
                    ad.subcategory = this.selectedSubcategory._id;
                    ad.price = this.adForm.value.price;
                    ad.currency = this.adForm.value.currency;
                    ad.priceType = this.adForm.value.priceType;
                    ad.currency = this.adForm.value.currency;
                    ad.user = this.loggedInUser._id;
                    ad._id = this.ad._id;

                    this._adService.updateAd(ad, this.adImages, this.images, this.removedImages)
                        .subscribe(
                            (result: any) => {
                                this._alertMessageService.handleMessage(
                                    'Tu anuncio se actualizó correctamente!',
                                    'success',
                                    true
                                );
                                this.router.navigate(['/backend/mis-avisos']);
                            }
                        );
                } else {
                    this.errorUserCity = true;
                }
            } else {
                this.errorImage = 'Seleccioná al menos una imagen para tu anuncio'
            }
        } else {
            this.errorCategory = true;

            this._scrollToService.scrollTo(this.scrollConfig);
        }

    }

    updatePhone() {
        const obj = this.loggedInUser;
        obj.phone = this.phoneForm.value.phone ? this.phoneForm.value.phone : null;
        this._userService.updateContactInfo(obj, this.loggedInUser._id)
            .subscribe(user => {
                this.loggedInUser = user;
                this._authService.updateSessionUser(user);
                $('#modal-phone').modal('toggle');
            });
    }

    updateCity() {
        const obj = this.loggedInUser;
        obj.city = this.cityForm.value.cityProfile ? this.cityForm.value.cityProfile : null;
        this._userService.updateContactInfo(obj, this.loggedInUser._id)
            .subscribe(user => {
                this.loggedInUser = user;
                this._authService.updateSessionUser(user);
                this.errorUserCity = false;
                $('#modal-city').modal('toggle');
            });
    }

    loggedIn(user) {
        this.loggedInUser = user;
    }

    onCancel() {
        this.router.navigate(['/backend/mis-avisos']);
    }

}
