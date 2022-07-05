import {Component, OnInit} from '@angular/core';
import {AuthService} from '../../../auth/auth.service';
import {APPCONFIG} from '../../../config';

declare var $: any;

@Component({
    selector: 'app-breadcrumbs-frontend',
    templateUrl: 'breadcrumbs-frontend.component.html'
})

export class BreadcrumbsFrontendComponent implements OnInit {

    loggedInUser;
    randomY = Math.random() * 100;

    constructor(private _authService: AuthService) {}

    ngOnInit() {
        if (this._authService.isLoggedIn() && this._authService.hasRol(APPCONFIG.roles.USER)) {
            this.loggedInUser = this._authService.getSessionUser();
        }
    }
}
