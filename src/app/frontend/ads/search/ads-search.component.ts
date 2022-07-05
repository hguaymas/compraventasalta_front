import {AfterViewInit, Component, OnInit, ViewEncapsulation} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {AdService} from '../../../services/ad.service';
import {CategoryService} from '../../../services/category.service';
import {APPCONFIG} from '../../../config';
import {CityService} from '../../../services/city.service';
import {combineLatest, forkJoin} from 'rxjs';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {Category} from '../../../models/category.model';
import {Location, LocationStrategy, PlatformLocation} from '@angular/common';
import * as  moment from 'moment';

declare var $: any;

@Component({
    selector: 'app-ad-search',
    templateUrl: './ads-search.component.html',
    // styleUrls: ['../../../../assets/css/backend-layout.component.css']
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
export class AdSearchComponent implements OnInit, AfterViewInit {
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
    term;
    pager: any = {};
    page = 1;
    lastPage;
    total = 0;
    sort;
    sortByList = [];

    constructor(public activatedRoute: ActivatedRoute,
                public router: Router,
                private url: LocationStrategy,
                private location: PlatformLocation,
                public _adService: AdService,
                public _categoryService: CategoryService,
                public _cityService: CityService) {
        this.config = APPCONFIG;
        moment.updateLocale('es', {});
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
        this.priceForm = new FormGroup({
            priceFrom: new FormControl(null),
            priceTo: new FormControl(null)
        });
        this.currentUrl = this.activatedRoute.snapshot.url;
        this.activatedRoute.queryParams
            .subscribe(params => {
                const term = params['q'] ? params['q'] : '';
                this.page = params['page'] ? Number(params['page']) : 1;
                this.sort = params['orden'] ? params['orden'] : this.config.sortByList[0].value;
                this.term = term;
                this._adService.updateSearchTerm(term);
                this.categorySlug = params['categoria'] ? params['categoria'] : null;
                this.citySlug = params['ciudad'] ? params['ciudad'] : null;
                this.priceFrom = params['precioDesde'] ? params['precioDesde'] : null;
                this.priceTo = params['precioHasta'] ? params['precioHasta'] : null;
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
                                        const ads = this.searchAds(term);
                                        this.subscribeAds(ads);
                                    }
                                );
                        } else {
                            const ads = this.searchAds(term);
                            this.subscribeAds(ads);
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

                                                    const ads = this.searchAds(term);
                                                    this.subscribeAds(ads);
                                                }
                                            );
                                    } else {
                                        const ads = this.searchAds(term);
                                        this.subscribeAds(ads);
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
                                    const ads = this.searchAds(term);
                                    this.subscribeAds(ads);
                                }
                            }
                        );
                } else {

                    const ads = this.searchAds(term);
                    this.subscribeAds(ads);
                }
            });
    }

    subscribeAds(ads) {
        const cities = this._cityService.getCities();
        const categories = this._categoryService.getCategories();
        ads.subscribe(result => {

                const citiesCounts = [];
                const categoriesCounts = [];
                forkJoin([cities, categories]).subscribe(res => {
                    for (const city of res[0]) {
                        for (const cityCount of result.response.aggregations.city_counts.buckets) {
                            if (cityCount.key === city._id) {
                                citiesCounts.push({
                                    city: city,
                                    count: cityCount.doc_count
                                });
                                break;
                            }
                        }
                    }
                    this.cities = citiesCounts;
                    for (const category of res[1]) {
                        for (const categoryCount of result.response.aggregations.category_counts.buckets) {
                            if (categoryCount.key === category._id) {
                                categoriesCounts.push({
                                    category: category,
                                    count: categoryCount.doc_count
                                });
                                break;
                            }
                        }
                    }

                    this.categories = categoriesCounts;
                });
                this.total = result.response.hits.total;
                this.ads = result.ads;
                let current = this.page,
                    last = result.totalPages,
                    delta = 2,
                    left = current - delta,
                    right = current + delta + 1,
                    range = [],
                    rangeWithDots = [],
                    l;

                for (let i = 1; i <= last; i++) {
                    if (i == 1 || i == last || i >= left && i < right) {
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
            }
        );
    }

    searchAds(term) {
        const queryParams = [];
        if (this.priceFrom && this.priceTo) {
            queryParams.push({name: 'priceFrom', value: this.priceFrom});
            queryParams.push({name: 'priceTo', value: this.priceTo});
        } else if (this.priceFrom && !this.priceTo) {
            queryParams.push({name: 'priceFrom', value: this.priceFrom});
        } else if (!this.priceFrom && this.priceTo) {
            queryParams.push({name: 'priceTo', value: this.priceTo});
        }
        if (this.city) {
            queryParams.push({name: 'city', value: this.city._id});
        }
        if (this.category) {
            queryParams.push({name: 'category', value: this.category._id});
        }
        queryParams.push({
            name: 'sortBy', value: this.sort
        });

        return this._adService.searchAds(term, this.page, queryParams);
    }

    changeListType() {
        this.listType = this.listType === 'list' ? 'grid' : 'list';
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
        }, 10);
    }

    onFilterPrice() {
        const from = this.priceForm.value.priceFrom;
        const to = this.priceForm.value.priceTo;
        this.priceFrom = from;
        this.priceTo = to;

        const currentParams = this.activatedRoute.snapshot.queryParams;
        this.router.navigate([this.location.pathname], {
            queryParams: {...currentParams, 'precioDesde': from, 'precioHasta': to}
        });
    }

    principal(img) {

        return img.principal === true;
    }
}
