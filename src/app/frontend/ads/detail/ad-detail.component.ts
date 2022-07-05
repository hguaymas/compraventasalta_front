import {AfterViewChecked, AfterViewInit, Component, OnInit} from '@angular/core';
import {Location} from '@angular/common';
import {ActivatedRoute, Router} from '@angular/router';
import {AdService} from '../../../services/ad.service';
import {APPCONFIG} from '../../../config';
import {AlertMessageService} from '../../../shared/alerts/alert-message.service';
import {AuthService} from '../../../auth/auth.service';
import {UserService} from '../../../services/user.service';
import {Observable} from 'rxjs';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import * as moment from 'moment';
import {MessageService} from '../../../services/message.service';
import {Ad} from '../../../models/ad.model';
import {environment} from '../../../../environments/environment';
import {Meta, Title} from '@angular/platform-browser';
import {ScriptService} from '../../../services/script.service';
import { NgxGalleryAnimation, NgxGalleryImage, NgxGalleryImageSize, NgxGalleryOptions } from '@kolkov/ngx-gallery';

declare var $: any;

@Component({
    selector: 'app-ads-create',
    templateUrl: './ad-detail.component.html',
    styles: [`
        .tg-ad figure {
            text-align: center;
        }
    `]

})
export class AdDetailComponent implements OnInit, AfterViewInit {
    adSlug;
    categories: Array<any> = [];
    public config;
    pathImage;
    pathIcon;
    priceTypes = APPCONFIG.priceTypes;
    currencies = APPCONFIG.currencies;
    images: Array<any> = [];
    errorImage;
    loggedInUser: any;
    errorFacebook;
    galleryOptions: NgxGalleryOptions[];
    galleryImages: NgxGalleryImage[] = [];
    showPhone = false;
    adsByUser: Array<any> = [];
    relatedAds: Array<any> = [];
    contactButton: false;
    currentLocation;
    public contactForm: FormGroup;
    sendingMessage = false;

    priceType: string;
    ad = null;
    reportForm: FormGroup;

    owlCarouselConfig = {
        items : 1,
        nav: true,
        loop: true,
        dots: false,
        autoplay: true,
        dotsClass: 'tg-sliderdots',
        navClass: ['tg-prev', 'tg-next'],
        navContainerClass: 'tg-slidernav',
        navText: ['<span class="icon-chevron-left"></span>', '<span class="icon-chevron-right"></span>']
    };

    constructor(
        public activatedRoute: ActivatedRoute,
        public _adService: AdService,
        public _messageService: MessageService,
        private _userService: UserService,
        private _alertMessageService: AlertMessageService,
        public _authService: AuthService,
        public router: Router,
        public location: Location,
        private meta: Meta,
        private titleService: Title,
        private _scriptService: ScriptService
    ) {
        this.config = APPCONFIG;
        this.pathIcon = APPCONFIG.api_server + '/' + APPCONFIG.path_icons;
        this.currentLocation = APPCONFIG.host + location.path();
        moment.updateLocale('es', {});

    }

    ngOnInit() {
        this._scriptService.loadScript('//platform-api.sharethis.com/js/sharethis.js#property=5ae1f04e256cbf0011980394&product=social-ab');
        this.reportForm = new FormGroup({
            recaptcha: new FormControl(null, Validators.required),
            reason: new FormControl('ILLEGAL', Validators.required),
            email: new FormControl(null, [
                Validators.required,
                Validators.pattern('^[a-z0-9!#$%&\'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&\'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$')
            ]),
            message: new FormControl(null, Validators.required)
        });

        this.contactForm = new FormGroup({
            message: new FormControl(null, [Validators.required, Validators.minLength(10)])
        });
        this.activatedRoute
            .params
            .subscribe(params => {
                this.adSlug = params['adSlug'];
                this._adService.getAdBySlug(this.adSlug)
                    .subscribe(
                        (ad: any) => {
                            this.ad = ad;
                            if (ad.priceType) {
                                const index = this.config.priceTypes.findIndex(function(element) {
                                    return element.value === ad.priceType;
                                });
                                this.priceType = this.config.priceTypes[index].text;
                            }
                            this.galleryOptions = [
                                {
                                    /*width: '800px',*/
                                    height: '600px',
                                    imagePercent: 100,
                                    thumbnailsColumns: 4,
                                    imageAnimation: NgxGalleryAnimation.Slide,
                                    imageSize: NgxGalleryImageSize.Cover,
                                    previewZoom: true,
                                    previewCloseOnEsc: true,
                                    previewDescription: true
                                },
                                // max-width 800
                                {
                                    breakpoint: 800,
                                    width: '100%',
                                    height: '600px',
                                    imagePercent: 80,
                                    thumbnailsPercent: 20,
                                    thumbnailsMargin: 10,
                                    thumbnailMargin: 10
                                },
                                // max-width 400
                                {
                                    breakpoint: 400,
                                    preview: false
                                }
                            ];
                            for (const img of ad.images) {
                                this.galleryImages.push({
                                    small: this.config.cloudfront_server + '/' + this.config.imagesSizes.thumb + '/' + img.relativePath,
                                    medium: this.config.cloudfront_server + '/' + this.config.imagesSizes.medium + '/' + img.relativePath,
                                    big: img.pathCdn,
                                    description: ad.title
                                })
                            }
                            this.meta.updateTag({name: 'googleBot', content: 'index, follow' });
                            this.meta.updateTag({name: 'title', content: 'CompraVentaSalta :: ' + ad.title });
                            this.titleService.setTitle( 'CompraVentaSalta :: ' + ad.title );
                            this.meta.updateTag({property: 'fb:app_id', content: environment.FACEBOOK_APP_ID});
                            this.meta.updateTag({property: 'og:url', content: environment.HOST + '/anuncio/' + ad.slug });
                            this.meta.updateTag({property: 'og:type', content: 'website' });
                            this.meta.updateTag({property: 'og:title', content: 'CompraVentaSalta :: ' + ad.title });
                            this.meta.updateTag({property: 'og:description', content: ad.content });
                            this.meta.updateTag({name: 'description', content: ad.content });
                            if (!ad.mainImage) {
                                this.meta.updateTag({property: 'og:image', content: environment.HOST + '/assets/images/logo_4.png'});
                                this.meta.updateTag({property: 'og:image:type', content: 'images/png'});
                            } else {
                                this.meta.updateTag({property: 'og:image', content: ad.mainImage.pathCdn});
                                this.meta.updateTag({property: 'og:image:type', content: ad.mainImage.mimeType});
                            }
                            this._adService.getAdsByUser(ad._id)
                                .subscribe((ads: any) => {
                                        this.adsByUser = ads;
                                    }
                                );
                            this._adService.getRelatedAds(ad._id)
                                .subscribe((ads: any) => {
                                    this.relatedAds = ads;
                                })
                        }
                    );

            });
        if (this._authService.isLoggedIn() && this._authService.hasRol(APPCONFIG.roles.USER)) {
            this.loggedInUser = this._authService.getSessionUser();
        }
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


    toggleShowPhone() {
        this.showPhone = !this.showPhone;
    }

    loggedIn(user) {
        this.loggedInUser = user;
    }

    sendMessage() {
        this.sendingMessage = true;
        const message = this.contactForm.value.message;
        this._messageService.sendMessage(this.ad._id, message)
            .subscribe(response => {
                this.sendingMessage = false;
                this._alertMessageService.handleMessage('Excelente!, tu mensaje ha sido enviado. Pronto se pondrán en contacto con vos.', 'success');
                this.contactForm.reset();
            },
            error => {
                this.sendingMessage = false;
            });
    }

    onCancelReport() {
        $('#modal-report-spam').modal('toggle');
    }

    onSubmitReport() {
        this._adService.reportAd(this.reportForm.value.reason, this.reportForm.value.email, this.reportForm.value.message, this.ad._id)
            .subscribe(
                (result: any) => {
                    this._alertMessageService.handleMessage(
                        'Muchas gracias por colaborar y reportar este aviso.<br/>Nuestro equipo lo evaluará y tomará las medidas en caso de corresponder.',
                        'success',
                        true
                    );
                    this.reportForm.reset();
                    $('#modal-report-spam').modal('toggle');
                }
            );
    }
}
