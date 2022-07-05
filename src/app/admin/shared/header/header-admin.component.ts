import {AfterViewInit, Component} from '@angular/core';

declare var $: any;

@Component({
    selector: 'app-header-admin',
    templateUrl: './header-admin.component.html'
})

export class HeaderAdminComponent implements AfterViewInit {

    ngAfterViewInit() {
        // SCROLLBARS
        setTimeout(() => {
            if ($('.tg-verticalscrollbar').length > 0) {
                const _tg_verticalscrollbar = $('.tg-verticalscrollbar');
                _tg_verticalscrollbar.mCustomScrollbar({
                    axis: 'y',
                });
            }
            if ($('.tg-horizontalthemescrollbar').length > 0) {
                const _tg_horizontalthemescrollbar = $('.tg-horizontalthemescrollbar');
                _tg_horizontalthemescrollbar.mCustomScrollbar({
                    axis: 'x',
                    advanced: {autoExpandHorizontalScroll: true},
                });
            }
            $('.tg-navigation ul li.menu-item-has-children, .tg-navdashboard ul li.menu-item-has-children, .tg-navigation ul li.menu-item-has-mega-menu').prepend('<span class="tg-dropdowarrow"><i class="fa fa-angle-down"></i></span>');
            $('.tg-navigation ul li.menu-item-has-children span, .tg-navdashboard ul li.menu-item-has-children span, .tg-navigation ul li.menu-item-has-mega-menu span').on('click', function() {
                $(this).parent('li').toggleClass('tg-open');
                $(this).next().next().slideToggle(300);
            });
        }, 10);
    }

}
