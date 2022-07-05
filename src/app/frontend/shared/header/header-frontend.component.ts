import {AfterViewInit, Component, OnInit} from '@angular/core';
import {AuthService} from '../../../auth/auth.service';
import {APPCONFIG} from '../../../config';
import {ActivatedRoute, Router} from '@angular/router';
import {AdService} from '../../../services/ad.service';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {Location} from '@angular/common';
import {CategoryService} from '../../../services/category.service';
import {CityService} from '../../../services/city.service';

declare var $: any;

@Component({
    selector: 'app-header-frontend',
    templateUrl: 'header-frontend.component.html'
})

export class HeaderFrontendComponent implements OnInit, AfterViewInit {

    loggedInUser;
    term;
    public searchForm: FormGroup;
    searching = false;
    categories = [];
    cities = [];

    constructor(
        public _authService: AuthService,
        private router: Router,
        private _adService: AdService,
        private _categoryService: CategoryService,
        private _cityService: CityService
    ) {}

    ngOnInit() {
        this._categoryService.getCategories()
            .subscribe(response => {
                this.categories = response;
                this._categoryService.categoryListObs.next(response);
            });
        this._cityService.getCities()
            .subscribe(response => {
                this.cities = response;
                this._cityService.cityListObs.next(response);
            });
        this._adService.updatedTermObs
            .subscribe((updatedTerm) => {
               this.term = updatedTerm;
            });
        this.searchForm = new FormGroup({
            term: new FormControl(null, [Validators.required])
        });
        this._authService.updatedUserObs
            .subscribe(
                (updatedUser) => {
                    this.loggedInUser = updatedUser !== undefined ? updatedUser : null;
                }
            );
    }

    onLogout() {
        this._authService.logout();
        this._authService.updateSessionUser(null);
        this.router.navigate(['/']);
    }


    searchAds() {
        const term = this.searchForm.value.term;
        this._adService.updateSearchTerm(term);
        this.router.navigate(['/buscar'], { queryParams: { q: term } });
    }

    ngAfterViewInit() {
        // SCROLLBARS
        setTimeout(() => {
            $('.tg-navigation ul li.menu-item-has-children, .tg-navdashboard ul li.menu-item-has-children, .tg-navigation ul li.menu-item-has-mega-menu').prepend('<span class="tg-dropdowarrow"><i class="fa fa-angle-down"></i></span>');
            $('.tg-navigation ul li.menu-item-has-children span, .tg-navdashboard ul li.menu-item-has-children span, .tg-navigation ul li.menu-item-has-mega-menu span').on('click', function() {
                $(this).parent('li').toggleClass('tg-open');
                $(this).next().next().slideToggle(300);
            });
        }, 10);
    }
}
