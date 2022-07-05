import {AfterViewInit, Component, Input, OnInit, ViewEncapsulation} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';

import {APPCONFIG} from '../../../config';


declare var $: any;

@Component({
    selector: 'app-search-menu',
    templateUrl: './search-menu.component.html',
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
export class SearchMenuComponent implements OnInit, AfterViewInit {
    @Input() categorySlug;
    @Input() citySlug;
    @Input() city;
    @Input() category;
    @Input() categories: Array<any> = [];
    @Input() cities: Array<any> = [];
    config;
    @Input() priceFrom;
    @Input() priceTo;
    @Input() term;

    constructor(public activatedRoute: ActivatedRoute,
                public router: Router
                ) {
        this.config = APPCONFIG;
    }

    ngOnInit() {
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
}
