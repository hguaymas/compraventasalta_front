import {AfterViewInit, Component, EventEmitter, OnInit, Output} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {AbstractControl, FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {APPCONFIG} from '../config';
import {FacebookService, InitParams, LoginResponse} from 'ngx-facebook';
import {UserService} from '../services/user.service';
import {AlertMessageService} from '../shared/alerts/alert-message.service';
import {AuthService} from './auth.service';

declare var $: any;

@Component({
    selector: 'app-login',
    templateUrl: './account-activation.component.html',
    styles: [`
        .tg-content {
            padding: 40px 0;
        }
    `]
})
export class AccountActivationComponent implements OnInit, AfterViewInit {
    public config;
    loggedInUser: any;
    errorFacebook;
    activated = false;
    @Output() onLoggedIn = new EventEmitter<any>();
    public errorActivation = null;
    public errorMessage = '';
    public userId = null;

    constructor(
        private _userService: UserService,
        private _alertMessageService: AlertMessageService,
        public _authService: AuthService,
        public router: Router,
        private fb: FacebookService,
        private formBuilder: FormBuilder,
        public activatedRoute: ActivatedRoute
    ) {
        this.config = APPCONFIG;
    }

    ngOnInit() {
        this.activatedRoute.params
            .subscribe(params => {
                const user = params['user'] ? params['user'] : '';
                const token = params['token'] ? params['token'] : '';
                this._authService.activateAccount(user, token)
                    .subscribe(
                        response => {
                            this.activated = true;
                        },
                        error => {
                                this.errorMessage = error.error.message;
                                this.userId = error.error.user;
                        })
            });
    }

    sendActivationLink(user) {
        this._authService.sendActivationLink(user)
            .subscribe(response => {
                this._alertMessageService.handleMessage('Se ha enviado nuevamente el enlace de activación. <br/>Revisá tu correo para activar tu cuenta.', 'success', true);
            })
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
        }, 10);
    }

    loginWithFacebook(): void {
        this.fb.login()
            .then((response: LoginResponse) => {
                this._authService.loginFacebook(response.authResponse.accessToken)
                    .subscribe(
                        user => {
                            this.loggedInUser = user;
                            this._authService.updateSessionUser(user);
                            this.router.navigate(['/backend/mis-avisos']);
                        },
                        error => {
                            this.errorFacebook = error.error;
                        }
                    );
            })
            .catch((error: any) => console.error(error));
    }

}
