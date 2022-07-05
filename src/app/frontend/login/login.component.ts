import {AfterViewInit, Component, EventEmitter, OnInit, Output} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {AbstractControl, FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {APPCONFIG} from '../../config';
import {AlertMessageService} from '../../shared/alerts/alert-message.service';
import {AuthService} from '../../auth/auth.service';
import {FacebookService, InitParams, LoginResponse} from 'ngx-facebook';
import {UserService} from '../../services/user.service';
import {User} from '../../models/user.model';
import {combineLatest} from 'rxjs';

declare var $: any;

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styles: [`
        .tg-content {
            padding: 40px 0;
        }
    `]
})
export class LoginComponent implements OnInit, AfterViewInit {
    public config;
    loggedInUser: any;
    errorFacebook;
    public formLogin: FormGroup;
    public formRegister: FormGroup;
    public formForgotPassword: FormGroup;
    public errorLogin;
    public showLogin = 'block';
    public showRegister = 'none';
    public showForgotPassword = 'none';
    @Output() onLoggedIn = new EventEmitter<any>();
    public errorActivation = null;
    returnUrl;

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
        const initParams: InitParams = {
            appId: APPCONFIG.facebook.appId,
            xfbml: true,
            version: 'v3.1'
        };

        fb.init(initParams);

        this.formLogin = formBuilder.group({
            'loginEmail': ['', [
                Validators.required,
                Validators.pattern('^[a-z0-9!#$%&\'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&\'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$')
            ]],
            'loginPassword': ['', Validators.required]
        });

        this.formForgotPassword = formBuilder.group({
            'forgotEmail': ['', [
                Validators.required,
                Validators.pattern('^[a-z0-9!#$%&\'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&\'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$')
            ]]
        });

        this.formRegister = formBuilder.group({
            'regEmail': ['', [
                Validators.required,
                Validators.pattern('^[a-z0-9!#$%&\'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&\'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$')
            ]],
            'regRecaptcha': [null, Validators.required],
            'regPassword': ['', Validators.required],
            'regPasswordConfirm': ['', [Validators.required, this.passwordMatch]]
        });
    }

    ngOnInit() {
        this.activatedRoute.queryParams
            .subscribe(params => {
                this.returnUrl = params['returnUrl'] ? params['returnUrl'] : '';
            });

        if (this.router.url.startsWith('/account_activation')) {
            this.activatedRoute.params
                .subscribe(params => {
                    const user = params['user'] ? params['user'] : '';
                    const token = params['token'] ? params['token'] : '';
                });

        }
        if (this.router.url === '/ingresar') {
            this.showRegister = 'none';
            this.showLogin = 'block';
            this.showForgotPassword = 'none';
            this.formForgotPassword.reset();
            this.formRegister.reset();
        } else if (this.router.url === '/registrarse') {
            this.showRegister = 'block';
            this.showLogin = 'none';
            this.showForgotPassword = 'none';
            this.formLogin.reset();
            this.formForgotPassword.reset();
        } else if (this.router.url === '/recuperar-password') {
            this.showRegister = 'none';
            this.showLogin = 'none';
            this.showForgotPassword = 'block';
            this.formRegister.reset();
            this.formLogin.reset();
        }

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
                            if (this.returnUrl) {
                                this.router.navigate([this.returnUrl]);
                            } else {
                                this.router.navigate(['/backend/mis-avisos']);
                            }
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
                    this.onLoggedIn.emit(this.loggedInUser);
                    if (this.returnUrl) {
                        this.router.navigate([this.returnUrl]);
                    } else {
                        this.router.navigate(['/backend/mis-avisos']);
                    }
                },
                error => {

                    this.errorLogin = error.error.message;
                }
            );
    }

    public onSubmitForgotPassword(values: Object): void {
        const user = new User();
        user.email = this.formForgotPassword.value.forgotEmail;
        this._authService.getNewPassword(user)
            .subscribe(
                data => {
                    this._alertMessageService.handleMessage('Te enviamos un correo con los pasos a seguir para recuperar tu contraseña', 'success');
                    this.router.navigate(['/ingresar']);
                },
                error => {

                    this.errorLogin = error.error;
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
                        'FELICITACIONES!!! Ya estás registrado en CompraVentaSalta!<br/> ' +
                        'Te enviamos un email con un enlace para activar tu cuenta. Revisá tu correo!',
                        'success',
                        true
                    );
                    this.formRegister.reset();
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
        this.router.navigateByUrl('/registrarse');
    }

    onForgotPassword() {
        this.router.navigateByUrl('/recuperar-password');
    }

    onLogin() {
        this.router.navigateByUrl('/ingresar');
    }
}
