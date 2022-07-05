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
    selector: 'app-recover-password',
    templateUrl: './recover-password.component.html',
    styles: [`
        .tg-content {
            padding: 40px 0;
        }
    `]
})
export class RecoverPasswordComponent implements OnInit, AfterViewInit {
    public config;
    user: any;
    token: string;
    errorFacebook;
    public formRecover: FormGroup;
    public errorLogin;
    public errorMessage = '';

    constructor(
        private _userService: UserService,
        private _alertMessageService: AlertMessageService,
        public _authService: AuthService,
        public router: Router,
        private formBuilder: FormBuilder,
        public activatedRoute: ActivatedRoute
    ) {
        this.config = APPCONFIG;
        this.formRecover = formBuilder.group({
            'email': [{value: '', disabled: true}, [
                Validators.required,
                Validators.pattern('^[a-z0-9!#$%&\'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&\'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$')
            ]],
            'recaptcha': [null, Validators.required],
            'password': ['', Validators.required],
            'passwordConfirm': ['', [Validators.required, this.passwordMatch]]
        });
    }

    ngOnInit() {
            this.activatedRoute.params
                .subscribe(params => {
                    const user = params['user'] ? params['user'] : '';
                    const token = params['token'] ? params['token'] : '';
                    this.token = token;
                    this._authService.checkUserToken(user, token)
                        .subscribe(userOk => {
                            this.user = userOk;
                        }, error => {
                            this.errorMessage = error.error.message;
                        })
                });
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

    public onSubmitRegister(values: Object): void {
        const password = this.formRecover.value.password;
        this._userService.updateRequestedPassword(this.user._id, this.token, password)
            .subscribe(
                data => {

                    this._alertMessageService.handleMessage(
                        'Se actualizó tu contraseña correctamente!<br/> ' +
                        'Ya podés iniciar sesión con tu nueva contraseña',
                        'success',
                        true
                    );
                    this.formRecover.reset();
                    this.router.navigate(['/ingresar']);
                },
                error => {

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
}
