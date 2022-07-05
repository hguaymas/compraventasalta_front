import {AfterViewInit, Component, EventEmitter, OnInit, Output} from '@angular/core';
import {Router} from '@angular/router';
import {AbstractControl, FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {APPCONFIG} from '../../config';
import {AlertMessageService} from '../../shared/alerts/alert-message.service';
import {AuthService} from '../../auth/auth.service';
import {FacebookService, InitParams, LoginResponse} from 'ngx-facebook';
import {UserService} from '../../services/user.service';
import {User} from '../../models/user.model';

declare var $: any;

@Component({
    selector: 'app-login-modal',
    templateUrl: './login-modal.component.html'
})
export class LoginModalComponent implements OnInit, AfterViewInit {
    public config;
    loggedInUser: any;
    errorFacebook;
    public formLogin: FormGroup;
    public formRegister: FormGroup;
    public errorLogin;
    public showLogin = 'block';
    public showRegister = 'none';
    @Output() onLoggedIn = new EventEmitter<any>();


    constructor(
        private _userService: UserService,
        private _alertMessageService: AlertMessageService,
        public _authService: AuthService,
        public router: Router,
        private fb: FacebookService,
        private formBuilder: FormBuilder
    ) {
        this.config = APPCONFIG;
        const initParams: InitParams = {
            appId: APPCONFIG.facebook.appId,
            xfbml: true,
            version: 'v8.0'
        };

        fb.init(initParams);

        this.formLogin = formBuilder.group({
            'loginEmail': ['', [
                Validators.required,
                Validators.pattern('^[a-z0-9!#$%&\'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&\'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$')
            ]],
            'loginPassword': ['', Validators.required]
        });

        this.formRegister = formBuilder.group({
            'regEmail': ['', [
                Validators.required,
                Validators.pattern('^[a-z0-9!#$%&\'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&\'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$')
            ]],
            'regPassword': ['', Validators.required],
            'regPasswordConfirm': ['', [Validators.required, this.passwordMatch]],
            'regRecaptcha': [null, Validators.required]
        });
    }

    ngOnInit() {
        if (this._authService.isLoggedIn() && this._authService.hasRol(APPCONFIG.roles.USER)) {
            this.loggedInUser = this._authService.getSessionUser();
        }
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
        this.fb.login({
            scope: APPCONFIG.facebook.scope,
            return_scopes: true,
            enable_profile_selector: true
        })
            .then((response: LoginResponse) => {
                this._authService.loginFacebook(response.authResponse.accessToken)
                    .subscribe(
                        user => {
                            this.loggedInUser = user;
                            this._authService.updateSessionUser(user);
                            $('#modal-login').modal('toggle');
                            this.onLoggedIn.emit(this.loggedInUser);
                        },
                        error => {

                            this.errorFacebook = error.error;
                        }
                    );
            })
            .catch((error: any) => console.error(error));
    }

    public onSubmitLogin(values: Object): void {
        const user = new User();
        user.email = this.formLogin.value.loginEmail;
        user.password = this.formLogin.value.loginPassword;
        this._authService.login(user)
            .subscribe(
                data => {
                    this.errorLogin = null;

                    localStorage.setItem('as_token', data.token);
                    localStorage.setItem('as_user_id', data.userId);
                    localStorage.setItem('as_user', JSON.stringify(data.user));
                    localStorage.setItem('as_exp', data.exp);
                    this.loggedInUser = data.user;
                    this._authService.updateSessionUser(data.user);
                    $('#modal-login').modal('toggle');
                    this.onLoggedIn.emit(this.loggedInUser);
                },
                error => {

                    this.errorLogin = error.error.message;
                }
            );
    }

    public onSubmitRegister(values: Object): void {
        const user = new User();
        user.email = this.formRegister.value.regEmail;
        user.password = this.formRegister.value.regPassword;
        this._userService.registerUser(user)
            .subscribe(
                data => {

                    this._alertMessageService.handleMessage(
                        'FELICITACIONES!!! Ya estás registrado!<br/> ' +
                        'Te enviamos un email con un enlace para activar tu cuenta.<br/>' +
                        'Revisá tu correo para activar tu cuenta!<br/>' +
                        '<button class="tg-btn-sm" (click)="sendLink(data)">Enviar nuevamente</button>',
                        'success',
                        true
                    );
                },
                error => {

                    this.errorLogin = error.error;
                }
            );
    }

    sendLink(user) {
        this._authService.sendActivationLink(user._id)
            .subscribe(response => {
                this._alertMessageService.close();
                this._alertMessageService.handleMessage('Email enviado correctamente. Revisa tu correo para activar tu cuenta', 'success');
            });
    }

    passwordMatch(control: AbstractControl) {
        const paswd = control.root.get('password');
        if (paswd && control.value !== paswd.value) {
            return {
                passwordMatch: true
            };
        }
        return null;
    }

    onRegister() {
        this.showRegister = 'block';
        this.showLogin = 'none';
        this.formLogin.reset();
    }

    onLogin() {
        this.showRegister = 'none';
        this.showLogin = 'block';
        this.formRegister.reset();
    }
}
