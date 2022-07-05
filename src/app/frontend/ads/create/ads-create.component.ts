import {ActivatedRoute, Router} from '@angular/router';
import {AdService} from '../../../services/ad.service';
import {CategoryService} from '../../../services/category.service';
import {AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {APPCONFIG} from '../../../config';
import {Ad} from '../../../models/ad.model';
import {AlertMessageService} from '../../../shared/alerts/alert-message.service';
import {AuthService} from '../../../auth/auth.service';
import {FacebookService, InitParams, LoginResponse} from 'ngx-facebook';
import {CityService} from '../../../services/city.service';
import {UserService} from '../../../services/user.service';
import {User} from '../../../models/user.model';
import {ScrollToConfigOptions, ScrollToService} from '@nicky-lenaers/ngx-scroll-to';
import {BlockUI, NgBlockUI} from 'ng-block-ui';
import * as _ from 'lodash';
import { AfterViewInit, Component, OnInit } from '@angular/core';

declare var $: any;

@Component({
    selector: 'app-ads-create',
    templateUrl: './ads-create.component.html',
    styleUrls: ['../../../../assets/css/dashboard.css']

})
export class AdCreateComponent implements OnInit, AfterViewInit {
    categorySlug;
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
    errorUserCity = false;
    loggedInUser: any;
    errorFacebook;
    facebookGroups = [];
    facebookSelectedGroups = [];
    public formLogin: FormGroup;
    public formRegister: FormGroup;
    public errorLogin;
    public showLogin = 'block';
    public showRegister = 'none';
    scrollConfig: ScrollToConfigOptions = {
        target: 'tg-wrapper',
        duration: 4000,
        easing: 'easeOutElastic'
    };
    @BlockUI('create_ad') blockUIAdCreate: NgBlockUI;

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
        private _scrollToService: ScrollToService
    ) {
        this.config = APPCONFIG;
        this.pathIcon = APPCONFIG.api_server + '/' + APPCONFIG.path_icons;
        const initParams: InitParams = {
            appId: APPCONFIG.facebook.appId,
            autoLogAppEvents : true,
            xfbml            : true,
            version          : 'v8.0'
        };

        fb.init(initParams);

        this.formLogin = formBuilder.group({
            'loginEmail': ['', [
                Validators.required,
                Validators.pattern('^[a-z0-9!#$%&\'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&\'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$')
            ]],
            'loginPassword': ['', Validators.required]
        });

        this.formRegister = formBuilder.group({
            'regEmail': ['', [
                Validators.required,
                Validators.pattern('^[a-z0-9!#$%&\'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&\'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$')
            ]],
            'regPassword': ['', Validators.required],
            'regPasswordConfirm': ['', [Validators.required, this.passwordMatch]]
        });
    }

    createItem(): FormGroup {
        return this.formBuilder.group({
            facebookGroup: [false]
        });
    }
    ngOnInit() {
        this._authService.checkIp();
        this.adForm = new FormGroup({
            title: new FormControl(null, [Validators.required, Validators.minLength(10)]),
            content: new FormControl(null, [Validators.required, Validators.minLength(10)]),
            category: new FormControl(null, Validators.required),
            subcategory: new FormControl(null, Validators.required),
            price: new FormControl(null),
            currency: new FormControl(null),
            priceType: new FormControl(null),
            images: new FormControl(null),
            facebookGroups: this.formBuilder.array([])
        });
        this.phoneForm = new FormGroup({
            phone: new FormControl(null)
        });

        this.cityForm = new FormGroup({
            cityProfile: new FormControl(null)
        });

        this._categoryService.getCategories()
            .subscribe(response => {
                this.categories = response;
                this.selectedCategory = this.categories.length > 0 ? this.categories[0] : null;
            });
        this._cityService.getCities()
            .subscribe(response => {
                this.cities = response;
            });
        if (this._authService.isLoggedIn() && this._authService.hasRol(APPCONFIG.roles.USER)) {
            this.loggedInUser = this._authService.getSessionUser();
            this.showFacebookGroups();
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
        }, 100);
    }

    validType(fileType) {
        return APPCONFIG.file_types.indexOf(fileType) !== -1;
    }

    removeImage(image) {
        this.images.splice(this.images.indexOf(image), 1);
        if (this.images.length === 1) {
            this.setPrincipal(this.images[0]);
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
                    if (this.images.length === 0) {
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
        for (const image of this.images) {
            if (image === img) {
                image.principal = true;
            } else {
                image.principal = false;
            }
        }
    }

    onSubmit() {
        if (this.selectedCategory && this.selectedSubcategory) {
            if ((this.images.length > 0 && this.selectedSubcategory.requiredImage) || !this.selectedSubcategory.requiredImage) {
                if (this.loggedInUser.city) {
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
                    ad.ipFrom = this._authService.getIp();
                    this.blockUIAdCreate.start('Espere por favor...');
                    this._adService.createAd(ad, this.images)
                        .subscribe(
                            (result: any) => {
                                this.adForm.reset();
                                this.selectedCategory = null;
                                this.selectedSubcategory = null;
                                this.images = [];
                                this.facebookSelectedGroups = [];
                                this.blockUIAdCreate.stop();
                                this.postToFacebookPage(result.obj);
                                // this.publishToGroups(result.obj);
                                this._alertMessageService.handleMessage(
                                    'FELICITACIONES!!! Tu anuncio se creó correctamente.<br/> Te deseamos muchos éxitos!',
                                    'success',
                                    true
                                );
                                this._scrollToService.scrollTo(this.scrollConfig);
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

    loginWithFacebook(): void {
        this.fb.login()
            .then((response: LoginResponse) => {
                this._authService.loginFacebook(response.authResponse.accessToken)
                    .subscribe(
                        user => {
                            this.loggedInUser = user;
                            $('#modal-login').modal('toggle');
                        },
                        error => {
                            this.errorFacebook = error.error;
                        }
                    );
            })
            .catch((error: any) => console.error(error));
    }

    updatePhone() {
        const obj = this.loggedInUser;
        obj.phone = this.phoneForm.value.phone ? this.phoneForm.value.phone : null;
        this._userService.updateContactInfo(obj, this.loggedInUser._id)
            .subscribe(user => {
                this.loggedInUser = user;
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
        this.showFacebookGroups();
    }

    public onSubmitLogin(values: Object): void {
        const user = new User();
        user.email = this.formLogin.value.loginEmail;
        user.password = this.formLogin.value.loginPassword;
        this._authService.login(user)
            .subscribe(
                data => {
                    localStorage.setItem('as_token', data.token);
                    localStorage.setItem('as_user_id', data.userId);
                    localStorage.setItem('as_user', JSON.stringify(data.user));
                    localStorage.setItem('as_exp', data.exp);
                    this.loggedInUser = data.user;
                    $('#modal-login').modal('toggle');
                },
                error => {
                    this.errorLogin = error.error;
                }
            );
    }

    public onSubmitRegister(values: Object): void {
        const user = new User();
        user.email = this.formRegister.value.regEmail;
        user.password = this.formRegister.value.regPassword;
        this._userService.registerUser(user)
            .subscribe(
                data => {
                    this._alertMessageService.handleMessage(
                        'FELICITACIONES!!! Ya estás registrado!<br/> Revisá tu correo para activar tu cuenta!',
                        'success',
                        true
                    );
                },
                error => {
                    this.errorLogin = error.error;
                }
            );
    }

    passwordMatch(control: AbstractControl) {
        const paswd = control.root.get('password');
        if (paswd && control.value !== paswd.value) {
            return {
                passwordMatch: true
            };
        }
        return null;
    }

    onRegister() {
        this.showRegister = 'block';
        this.showLogin = 'none';
        this.formLogin.reset();
    }

    onLogin() {
        this.showRegister = 'none';
        this.showLogin = 'block';
        this.formRegister.reset();
    }

    toggleSelectAll(event) {
        const facebookGroupsControls = <FormArray>this.adForm.controls['facebookGroups']
        for (const i in this.facebookGroups) {
            facebookGroupsControls.controls[i].get('facebookGroup').setValue(event.target.checked);
        }
        this.facebookSelectedGroups = event.target.checked ? this.facebookGroups : [];
    }

    toggleSelectGroup(event, group) {
        if (event.target.checked) {
            this.facebookSelectedGroups.push(group);
        } else {
            _.remove(this.facebookSelectedGroups, function (e) {
                return e.id === group.id;
            });
        }
    }

    showFacebookGroups() {
        if (this.loggedInUser && this.loggedInUser.facebook && this.loggedInUser.facebook.id) {
            const facebookId = this.loggedInUser.facebook.id;
            this.fb.getLoginStatus(true).then((response) => {
                console.log('facebook status', response);
                if (response.status === 'connected') {
                    this.fb.api(`/${facebookId}/groups`, 'get', {
                        fields: ['name', 'picture'],
                        limit: 100
                    })
                        .then((groups) => {
                            console.log('GRUPOS', groups);
                            this.facebookGroups = groups.data;
                            if (this.facebookGroups.length > 0) {
                                const facebookGroups = this.adForm.get('facebookGroups') as FormArray;
                                for (const group of this.facebookGroups) {
                                    facebookGroups.push(this.createItem());
                                }
                            }
                            setTimeout(() => {
                                if ($('.tg-verticalscrollbar').length > 0) {
                                    const _tg_verticalscrollbar = $('.tg-verticalscrollbar');
                                    _tg_verticalscrollbar.mCustomScrollbar({
                                        axis: 'y',
                                        scrollInertia: 250
                                    });
                                }
                            }, 100);
                        });
                }
            }).catch((err) => {
                console.log('facebook err', err);
            });
        }
    }

    publishToGroups(ad) {
        const message = `Hola amigos! Acabo de publicar este aviso en CompraVentaSalta.com.ar: \n
        " ${ad.title} "\n
        https://www.compraventasalta.com.ar/anuncio/${ad.slug}
        (Contactar haciendo clic en el enlace)`
        for (const group of this.facebookSelectedGroups) {
            this.fb.api(`/${group.id}/feed?access_token=' + APPCONFIG.facebook.accessToken`, 'post', {
                message: message,
                access_token: APPCONFIG.facebook.accessToken
            });
        }
    }

    postToFacebookPage(ad) {
        const message = `Nuevo aviso en CompraVentaSalta.com.ar: \n
        " ${ad.title} "\n
        https://www.compraventasalta.com.ar/anuncio/${ad.slug}
        (Contactar haciendo clic en el enlace)`
        this.fb.api('/' + APPCONFIG.facebook.pageId + '/feed?access_token=' + APPCONFIG.facebook.accessToken, 'post', {
            message: message,
            link: 'https://www.compraventasalta.com.ar/anuncio/vendo-coche-para-bebe',
            access_token: APPCONFIG.facebook.accessToken
        })
    }
}
