import {Component, Input, OnInit} from '@angular/core';
import {AuthService} from '../../../auth/auth.service';
import {APPCONFIG} from '../../../config';

declare var $: any;

@Component({
    selector: 'app-breadcrumbs-backend',
    templateUrl: 'breadcrumbs-backend.component.html'
})

export class BreadcrumbsBackendComponent implements OnInit {

    loggedInUser;
    @Input() title: string;
    @Input() active: string;
    @Input() breadcrumbs: Array<any>;
    constructor(private _authService: AuthService) {}

    ngOnInit() {
        if (this._authService.isLoggedIn() && this._authService.hasRol(APPCONFIG.roles.USER)) {
            this.loggedInUser = this._authService.getSessionUser();
        }
    }
}
