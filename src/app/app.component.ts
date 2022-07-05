
import {filter} from 'rxjs/operators';
import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, NavigationEnd, NavigationStart, Router} from '@angular/router';
import {AuthService} from './auth/auth.service';
import {AdService} from './services/ad.service';
import {ScrollToConfigOptions, ScrollToService} from '@nicky-lenaers/ngx-scroll-to';
import {googleAnalytics} from '../assets/script';

import {Title} from '@angular/platform-browser';

declare var $: any;
@Component({
    selector: 'my-app',
    templateUrl: './app.component.html'
})

export class AppComponent implements OnInit {
    constructor(private router: Router, private _authService: AuthService, private _adService: AdService, private _scrollToService: ScrollToService, private titleService: Title) {
        this.router.routeReuseStrategy.shouldReuseRoute = function () {
            return false;
        };
        this.router.events.pipe(filter(event => event instanceof NavigationStart)).subscribe(event => {
            const url = event['url'];
            if (url !== null && url !== undefined && url !== '' && url.indexOf('null') < 0) {

                if (
                    !url.startsWith('/crear-anuncio') &&
                    !url.startsWith('/backend') &&
                    !url.startsWith('/ingresar') &&
                    !url.startsWith('/registrarse') &&
                    !url.startsWith('/recuperar-password')
                ) {
                    googleAnalytics(url);
                }
            }
        });
    }

    ngOnInit() {
        this.router.events.subscribe((evt) => {
            if (!(evt instanceof NavigationEnd)) {
                return;
            }
            const url = evt.url;
            if (!url.startsWith('/buscar')) {
                this._adService.updateSearchTerm('');
            }
            if (!url.startsWith('/anuncio/')) {
                this.titleService.setTitle('Compra Venta Salta :: Clasificados Gratis. Comprá y Vendé lo que quieras, cerca tuyo!');
            }
            /*const isSmoothScrollSupported = 'scrollBehavior' in document.documentElement.style;
            const options = {
                behavior: "smooth",
                left: 0,
                top: 0
            };
            if (isSmoothScrollSupported) {
                // Native smooth scrolling
                window.scrollTo({
                    behavior: "smooth",
                    left: 0,
                    top: 0
                });
            } else {
                // Old way scrolling without effects
                window.scrollTo(options.left, options.top);
            }*/
            const config: ScrollToConfigOptions = {
                target: 'tg-wrapper',
                // duration: 4000,
                easing: 'easeOutElastic'
            };

            this._scrollToService.scrollTo(config);
        });
    }
}
