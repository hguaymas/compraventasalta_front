import {AfterViewInit, Component, OnInit} from '@angular/core';
import {APPCONFIG} from '../../config';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {Ad} from '../../models/ad.model';
declare var $: any;

@Component({
    selector: 'app-terms-conditions',
    templateUrl: './terms-conditions.component.html'
})
export class TermsConditionsComponent implements OnInit, AfterViewInit {
    test: Date = new Date();
    randomY = Math.random() * 100;
    brand = APPCONFIG.brand;
    constructor() {}

    ngOnInit() {

    }

    onSubmit() {
    }

    ngAfterViewInit() {
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
}
