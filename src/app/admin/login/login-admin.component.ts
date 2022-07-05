import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {AbstractControl, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {AuthService} from '../../auth/auth.service';
import {User} from '../../models/user.model';

@Component({
    selector: 'app-login-admin',
    templateUrl: './login-admin.component.html'
})
export class LoginAdminComponent implements OnInit {
    public form: FormGroup;
    public email: AbstractControl;
    public password: AbstractControl;
    public error;

    constructor(public router: Router, fb: FormBuilder, private _authService: AuthService) {
        this.form = fb.group({
            'email': ['', [
                Validators.required,
                Validators.pattern('^[a-z0-9!#$%&\'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&\'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$')
            ]],
            'password': ['', Validators.required]
        });

        this.email = this.form.controls['email'];
        this.password = this.form.controls['password'];
    }

    ngOnInit() {}

    public onSubmit(values: Object): void {
        const user = new User();
        user.email = this.form.value.email;
        user.password = this.form.value.password;
        this._authService.login(user)
            .subscribe(
                data => {
                    localStorage.setItem('as_token', data.token);
                    localStorage.setItem('as_user_id', data.userId);
                    localStorage.setItem('as_user', JSON.stringify(data.user));
                    localStorage.setItem('as_exp', data.exp);
                    this.router.navigate(['admin/dashboard']);
                },
                error => {
                    this.error = error.error;
                }
            );
    }

}
