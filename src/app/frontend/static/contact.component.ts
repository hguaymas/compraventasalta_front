import {AfterViewInit, Component, OnInit} from '@angular/core';
import {APPCONFIG} from '../../config';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {Ad} from '../../models/ad.model';
declare var $: any;

@Component({
    selector: 'app-contact',
    templateUrl: './contact.component.html'
})
export class ContactComponent implements OnInit, AfterViewInit {
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
            if ($('#tg-themecollapse').length > 0) {
                let _tg_themecollapse = $('#tg-themecollapse');
                _tg_themecollapse.collapse({
                    accordion: true,
                    query: '.tg-collaptabpane h3',
                    close: function() {this.slideUp(300); },
                    open: function() {this.slideDown(300); },
                });
            }
        }, 10);
    }
}
