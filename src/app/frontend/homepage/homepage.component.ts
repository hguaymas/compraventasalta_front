import {AfterViewInit, Component, OnDestroy, OnInit} from '@angular/core';
import {APPCONFIG} from '../../config';
import {CategoryService} from '../../services/category.service';
import {CityService} from '../../services/city.service';
import {FacebookService, InitParams} from 'ngx-facebook';
import {Meta} from '@angular/platform-browser';
import { environment } from '../../../environments/environment';
import {AdService} from '../../services/ad.service';
import * as moment from 'moment';
import {Subscription} from 'rxjs';

declare var $: any;

@Component({
    selector: 'app-homepage',
    templateUrl: './homepage.component.html',
    styleUrls: ['./homepage.component.css']
})
export class HomepageComponent implements OnInit, AfterViewInit, OnDestroy {
    test: Date = new Date();
    carouselConfig: any = {}
    categoryListGrouped: Array<any> = [];
    categories: Array<any> = [];
    cities: Array<any> = [];
    appConfig: any;
    routes;
    featured: Array<any> = [];
    latest: Array<any> = [];
    randomY = Math.random() * 100;
    host = environment.HOST;
    config;
    owlCarouselConfig = {
        items : 4,
        nav: false,
        loop: true,
        dots: true,
        // center: true,
        autoplay: true,
        dotsClass: 'tg-sliderdots',
        navClass: ['tg-prev', 'tg-next'],
        navContainerClass: 'tg-slidernav',
        navText: ['<span class="icon-chevron-left"></span>', '<span class="icon-chevron-right"></span>'],
        responsive: {
            0: { items: 1},
            480: { items: 1},
            568: { items: 2, slideBy: 'page'},
            768: { items: 2, slideBy: 'page' },
            1200: { items: 4, slideBy: 'page' }
        }
    };
    categoryListStatusSubscription: Subscription;
    cityListStatusSubscription: Subscription;

    constructor(public _categoryService: CategoryService, public _cityService: CityService, public fb: FacebookService, private meta: Meta, public _adService: AdService) {
        this.appConfig = APPCONFIG;
        this.config = APPCONFIG;
        this.routes = this.appConfig.routes;
        const initParams: InitParams = {
            appId: APPCONFIG.facebook.appId,
            xfbml: true,
            version: 'v8.0'
        };
        fb.init(initParams);
        this.meta.updateTag({name: 'googleBot', content: 'index, follow' });
        this.meta.updateTag({name: 'title', content: 'CompraVenta Salta :: Clasificados Gratis. Comprá y Vendé lo que quieras, cerca tuyo!' });
        this.meta.updateTag({property: 'og:url', content: environment.HOST });
        this.meta.updateTag({property: 'og:type', content: 'website' });
        this.meta.updateTag({property: 'og:title', content: 'Clasificados Gratis en Salta. Comprá y Vendé lo que quieras, cerca tuyo!' });
        this.meta.updateTag({property: 'og:description', content: 'Clasificados gratis Salta Compra y Venta de Articulos,Articulos usados,Servicios,Oportunidades,Clasificados,Clasificados Gratis,Avisos Gratis,Avisos Clasificados Gratis,Clasificados Gratis en Salta,Clasificados online,Compra y Vende,Publicidad Gratis,Anuncios Clasificados Gratuitos, Anuncio,Avisos,Avisos Gratis en Internet,Publicar un Aviso,Avisos Gratuitos en Salta,Clasificados Articulos Usados, Clasificados Empleo,Servicios Profesionales Gratis' });
        this.meta.updateTag({name: 'description', content: 'Clasificados gratis Salta Compra y Venta de Articulos,Articulos usados,Servicios,Oportunidades,Clasificados,Clasificados Gratis,Avisos Gratis,Avisos Clasificados Gratis,Clasificados Gratis en Salta,Clasificados online,Compra y Vende,Publicidad Gratis,Anuncios Clasificados Gratuitos, Anuncio,Avisos,Avisos Gratis en Internet,Publicar un Aviso,Avisos Gratuitos en Salta,Clasificados Articulos Usados, Clasificados Empleo,Servicios Profesionales Gratis' });
        this.meta.updateTag({property: 'og:image', content: environment.HOST + '/assets/images/logo_4.png'});
        this.meta.updateTag({property: 'og:image:type', content: 'images/png'});
        this.meta.updateTag({property: 'fb:app_id', content: environment.FACEBOOK_APP_ID});
        moment.updateLocale('es', {});

        this.categoryListStatusSubscription = this._categoryService.categoryListStatus$.subscribe(categories => {
            if (categories) {
                this.categories = categories;
            }
        });
        this.cityListStatusSubscription = this._cityService.cityListStatus$.subscribe(cities => {
            if (cities) {
                this.cities = cities;
            }
        });
    }


    ngOnInit() {
        this.getLatestAds();
        this.carouselConfig = {
            dots: false,
            infinite: false,
            speed: 300,
            slidesToShow: 4,
            slidesToScroll: 4,
            rows: 2,
            responsive: [
                {
                    breakpoint: 1024,
                    settings: {
                        slidesToShow: 3,
                        slidesToScroll: 3,
                        infinite: true,
                        dots: true
                    }
                },
                {
                    breakpoint: 600,
                    settings: {
                        slidesToShow: 2,
                        slidesToScroll: 2
                    }
                },
                {
                    breakpoint: 480,
                    settings: {
                        slidesToShow: 1,
                        slidesToScroll: 1
                    }
                }
                // You can unslick at a given breakpoint now by adding:
                // settings: "unslick"
                // instead of a settings object
            ]
        };
    }

    ngAfterViewInit() {
        setTimeout(() => {
        const slider = $('#ads-slider');
        if (slider.length > 0) {
            const _tg_postsslider = slider;
            _tg_postsslider.owlCarousel({
                items : 8,
                nav: true,
                loop: true,
                dots: true,
                // center: true,
                autoplay: true,
                dotsClass: 'tg-sliderdots',
                navClass: ['tg-prev', 'tg-next'],
                navContainerClass: 'tg-slidernav',
                navText: ['<span class="icon-chevron-left"></span>', '<span class="icon-chevron-right"></span>'],
                responsive: {
                    0: { items: 1},
                    480: { items: 1},
                    568: { items: 2, slideBy: 'page'},
                    768: { items: 2, slideBy: 'page' },
                    1200: { items: 3, slideBy: 'page' }
                }
            });
        }
        }, 100);
    }

    getLatestAds() {
        this._adService.getLatestAds()
            .subscribe(
                result => {

                    this.latest = result;
                }
            );
    }

    ngOnDestroy(): void {
        if (this.categoryListStatusSubscription) {
            this.categoryListStatusSubscription.unsubscribe();
        }
        if (this.cityListStatusSubscription) {
            this.cityListStatusSubscription.unsubscribe();
        }
    }
}
