import {AfterViewInit, Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {combineLatest, forkJoin} from 'rxjs';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {Location, LocationStrategy, PlatformLocation} from '@angular/common';
import * as  moment from 'moment';
import {Meta} from '@angular/platform-browser';
import {FacebookService, InitParams} from 'ngx-facebook';
import {environment} from '../../../../../environments/environment';
import {CategoryService} from '../../../../services/category.service';
import {CityService} from '../../../../services/city.service';
import {AdService} from '../../../../services/ad.service';
import {APPCONFIG} from '../../../../config';

declare var $: any;

@Component({
    selector: 'app-ads-listing-filter',
    templateUrl: './ads-listing-filter.component.html',
    styles: [`
        .tg-collapsetitle a span {
            margin: 0;
            width: 100%;
            float: left;
            font-weight: 500;
            padding: 0 0 0 10px;
            line-height: inherit;
            font-family: 'Quicksand', Arial, Helvetica, sans-serif;
        }
    `]
})
export class AdListingFilterComponent implements OnInit, AfterViewInit {
    categorySlug;
    subcategorySlug;
    citySlug;
    city;
    category;
    subcategory;
    ads: Array<any> = [];
    categories: Array<any> = [];
    cities: Array<any> = [];
    listType = 'list';
    config;
    currentUrl;
    priceForm: FormGroup;
    priceFrom;
    priceTo;
    filters = false;
    pager: any = {};
    page = 1;
    lastPage;
    sort;
    sortByList = [];
    host = environment.HOST;

    constructor(public activatedRoute: ActivatedRoute,
                public router: Router,
                private url: LocationStrategy,
                private location: PlatformLocation,
                public _adService: AdService,
                public _categoryService: CategoryService,
                public _cityService: CityService,
                private meta: Meta,
                public fb: FacebookService) {
        this.config = APPCONFIG;
        moment.updateLocale('es', {});
        const initParams: InitParams = {
            appId: APPCONFIG.facebook.appId,
            xfbml: true,
            version: 'v3.2'
        };

        fb.init(initParams);
    }

    setPage(page: number) {
        if (page < 1 || page > this.pager.totalPages) {
            return;
        }
        const currentParams = this.activatedRoute.snapshot.queryParams;
        this.router.navigate([this.location.pathname], {
            queryParams: {...currentParams, 'page': page}
        });
    }

    sortBy(event) {
        const currentParams = this.activatedRoute.snapshot.queryParams;
        this.router.navigate([this.location.pathname], {
            queryParams: {...currentParams, 'orden': event.target.value, 'page': 1}
        });
    }

    ngOnInit() {
        this.sortByList = this.config.sortByList;
        this.listType = this._adService.viewType;
        this.priceForm = new FormGroup({
            priceFrom: new FormControl(null),
            priceTo: new FormControl(null)
        });
        this.currentUrl = this.activatedRoute.snapshot.url;
        const parameters = this.activatedRoute.params;
        const queryParameters = this.activatedRoute.queryParams;
        const obsComb = combineLatest(parameters, queryParameters,
            (params, qparams) => ({ params, qparams }));

        obsComb.subscribe(results => {
            const params = results.params ? results.params : null;
            const queryParams = results.qparams ? results.qparams : null;

            this.page = queryParams['page'] ? Number(queryParams['page']) : 1;
            this.sort = queryParams['orden'] ? queryParams['orden'] : this.config.sortByList[0].value;

            this.categorySlug = params['categorySlug'] ? params['categorySlug'] : null;
            this.citySlug = params['citySlug'] ? params['citySlug'] : null;
            this.priceFrom = queryParams['priceFrom'] ? queryParams['priceFrom'] : null;
            this.priceTo = queryParams['priceTo'] ? queryParams['priceTo'] : null;

            this.filters = this.categorySlug + this.citySlug + this.priceFrom + this.priceTo;

            if (this.categorySlug && this.citySlug) {
                const category = this._categoryService.getCategoryBySlug(this.categorySlug);
                const city = this._cityService.getCityBySlug(this.citySlug);

                forkJoin([category, city]).subscribe(catCity => {

                    this.category = catCity[0] ? catCity[0][0] : null;
                    this.city = catCity[1] ? catCity[1] : null;

                    if (this.category.parentId) {
                        this._categoryService.getCategory(this.category.parentId)
                            .subscribe(
                                categoryParent => {
                                    this.subcategory = this.category;
                                    this.category = categoryParent;
                                    this.getAds(this.city, this.category, this.subcategory);
                                }
                            );
                    } else {
                        this.getAds(this.city, this.category, null);
                        this.getCategories();
                    }
                });
            } else if (this.categorySlug) {
                this._categoryService.getCategoryBySlug(this.categorySlug)
                    .subscribe(
                        category => {
                            this.category = category[0];
                            if (this.category) {
                                if (this.category.parentId) {
                                    this._categoryService.getCategory(this.category.parentId)
                                        .subscribe(
                                            categoryParent => {
                                                this.subcategory = this.category;
                                                this.category = categoryParent;

                                                this.getCities();
                                                this.getAds(null, this.category, this.subcategory);
                                            }
                                        );
                                } else {
                                    this.getAds(null, this.category, null);
                                    this.getCategories();
                                    this.getCities();
                                }
                            }
                        }
                    );
            } else if (this.citySlug) {
                this._cityService.getCityBySlug(this.citySlug)
                    .subscribe(
                        city => {
                            if (city) {
                                this.city = city;
                                this.getAds(city, null, null);
                            }
                        }
                    );
                this.getCategories();
            } else {

                const cities = this._cityService.getCitiesCountAds(this.category, this.subcategory);
                const categories = this._categoryService.getCategories();
                forkJoin([cities, categories]).subscribe(res => {
                    this.cities = res[0];
                    this.categories = res[1];
                    this.getAds(null, null, null);
                });
            }
        });
    }

    getAds(city, category, subcategory) {
        const queryParams = [{
            name: 'size', value: this.config.pageSize
        }];
        if (this.priceFrom && this.priceTo) {
            queryParams.push(
                {name: 'priceFrom', value: this.priceFrom},
                {name: 'priceTo', value: this.priceTo}
            );
        } else if (this.priceFrom && !this.priceTo) {
            queryParams.push(
                {name: 'priceFrom', value: this.priceFrom}
            );
        } else if (!this.priceFrom && this.priceTo) {
            queryParams.push(
                {name: 'priceTo', value: this.priceTo}
            );
        }
        queryParams.push({
            name: 'sortBy', value: this.sort
        });

        this._adService.getAdsPager(this.page, city, category, subcategory, queryParams)
            .subscribe(
                result => {
                    let current = this.page,
                        last = result.totalPages,
                        delta = 2,
                        left = current - delta,
                        right = current + delta + 1,
                        range = [],
                        rangeWithDots = [],
                        l;

                    for (let i = 1; i <= last; i++) {
                        if (i === 1 || i === last || i >= left && i < right) {
                            range.push(i);
                        }
                    }
                    for (const i of range) {
                        if (l) {
                            if (i - l === 2) {
                                rangeWithDots.push(l + 1);
                            } else if (i - l !== 1) {
                                rangeWithDots.push('...');
                            }
                        }
                        rangeWithDots.push(i);
                        l = i;
                    }
                    this.pager = rangeWithDots;
                    this.lastPage = last;
                    this.ads = result.ads;
                }
            );
    }

    getCities() {
        this._cityService.getCitiesCountAds(this.category, this.subcategory)
            .subscribe(response => {
                this.cities = response;
                return response;
            });
    }

    getCategories() {
        this._categoryService.getCategories()
            .subscribe(
                categories => {
                    this.categories = categories;
                }
            );
    }

    changeListType() {
        this._adService.toggleViewType();
        this.listType = this._adService.viewType;
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
            if ($('#tg-narrowsearchcollapse').length > 0) {
                const _openFirst = $('#tg-narrowsearchcollapse');
                _openFirst.collapse({
                    open: function () {
                        this.slideDown(300);
                    },
                    close: function () {
                        this.slideUp(300);
                    },
                });
                _openFirst.trigger('open');
            }
            const initParams: InitParams = {
                appId: APPCONFIG.facebook.appId,
                xfbml: true,
                version: 'v3.2'
            };
            this.fb.init(initParams);
        }, 10);
    }

    onFilterPrice() {
        const from = this.priceForm.value.priceFrom;
        const to = this.priceForm.value.priceTo;
        this.priceFrom = from;
        this.priceTo = to;

        const currentParams = this.activatedRoute.snapshot.queryParams;
        this.router.navigate([this.location.pathname], {
            queryParams: {...currentParams, 'priceFrom': from, 'priceTo': to}
        });
    }

    principal(img) {

        return img.principal === true;
    }

    addMetaTags() {

    }
}
