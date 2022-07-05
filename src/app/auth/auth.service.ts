
import {throwError as observableThrowError, Observable, BehaviorSubject} from 'rxjs';

import {catchError, map} from 'rxjs/operators';
import {Injectable} from '@angular/core';
import {APPCONFIG} from '../config';

import {HttpClient, HttpErrorResponse, HttpHeaders} from '@angular/common/http';
import {User} from '../models/user.model';
import * as moment from 'moment';
import {AlertMessageService} from '../shared/alerts/alert-message.service';

@Injectable()
export class AuthService {
    ip;
    public config = APPCONFIG;
    public updatedUser = new BehaviorSubject<any>(this.getSessionUser());
    updatedUserObs = this.updatedUser.asObservable();
    facebookGroups = [];

    constructor(private http: HttpClient, private _alertMessageService: AlertMessageService) {

    }

    activateAccount(user: string, token: string) {
        const body = JSON.stringify({
            user: user,
            token: token
        });
        const headers = new HttpHeaders({'Content-Type': 'application/json'});
        return this.http.post(this.config.api_account_activation, body, {headers: headers}).pipe(
            map((response: any) => response),
            catchError((error: HttpErrorResponse) => {
                // this._alertMessageService.handleMessage(error.error.message, 'error');
                return observableThrowError(error);
            }), );
    }

    sendActivationLink(userId) {
        const body = JSON.stringify({
            user: userId
        });
        const headers = new HttpHeaders({'Content-Type': 'application/json'});
        return this.http.post(this.config.api_account_activation + '/send_link', body, {headers: headers}).pipe(
            map((response: any) => response),
            catchError((error: HttpErrorResponse) => {
                this._alertMessageService.handleMessage(error.error.message, 'error');
                return observableThrowError(error);
            }), );
    }

    login(user: User) {
        const body = JSON.stringify(user);
        const headers = new HttpHeaders({'Content-Type': 'application/json'});
        return this.http.post(this.config.api_login, body, {headers: headers}).pipe(
            map((response: any) => response),
            catchError((error: HttpErrorResponse) => {
                // this._alertMessageService.handleMessage(error.error.message, 'error');
                return observableThrowError(error);
            }), );
    }

    getNewPassword(user: User) {
        const body = JSON.stringify({
            email: user.email
        });
        const headers = new HttpHeaders({'Content-Type': 'application/json'});
        return this.http.post(this.config.api_forgot_password, body, {headers: headers}).pipe(
            map((response: any) => response),
            catchError((error: HttpErrorResponse) => {
                this._alertMessageService.handleMessage(error.error.message, 'error');
                return observableThrowError(error);
            }), );
    }

    checkUserToken(userId, token) {
        const body = JSON.stringify({
            user: userId,
            token: token
        });
        const headers = new HttpHeaders({'Content-Type': 'application/json'});
        return this.http.post(this.config.api_user_token, body, {headers: headers}).pipe(
            map((response: any) => response),
            catchError((error: HttpErrorResponse) => {
                // this._alertMessageService.handleMessage(error.error.message, 'error');
                return observableThrowError(error);
            }), );
    }

    loginFacebook(accessToken: string) {
        const body = JSON.stringify({access_token: accessToken});
        const headers = new HttpHeaders({'Content-Type': 'application/json'});
        return this.http.post(this.config.api_login_facebook, body, {headers: headers}).pipe(
            map((response: any) => {
                localStorage.setItem('as_token', response.token);
                localStorage.setItem('as_method', response.method);
                localStorage.setItem('as_user_id', response.user._id);
                localStorage.setItem('as_user', JSON.stringify(response.user));
                localStorage.setItem('as_exp', response.exp);
                return response.user;
            }),
            catchError((error: HttpErrorResponse) => {
                // this._messageService.handleMessage(error.error, 'danger');
                return observableThrowError(error);
            }), );
    }

    logout() {
        localStorage.clear();
    }

    loginMethod() {
        return localStorage.getItem('as_method') || 'local';
    }

    isLoggedIn() {
        const token = localStorage.getItem('as_token');
        const exp = localStorage.getItem('as_exp');
        const now = moment().format('X');
        if (token !== null) {
            if (Number(exp) <= Number(now)) {
                this.logout();
                this.updateSessionUser();
                return false;
            }
            return true;
        } else {
            return false;
        }
    }

    getToken() {
        return localStorage.getItem('as_token');
    }

    getSessionUser() {
        return JSON.parse(localStorage.getItem('as_user')) ;
    }

    getSessionUserId() {
        return localStorage.getItem('as_user_id') ;
    }

    hasRol(rol: string) {
        const user = this.getSessionUser();
        const roles = user.roles;
        for (const r of roles) {
            if (r === rol) {
                return true;
            }
        }
        return false;
    }

    /*hasAccess(pageName) {
        let configurada = false;
        for(let acceso of accesos) {
            if(acceso.pagina == pageName) {
                configurada = true;
                if(this.hasAnyRol(acceso.roles)) {
                    return true;
                }
                break;
            }
        }
        if(!configurada) {
            return true;
        }
        return false;
    }*/

    hasAnyRol(roles: Array<any>) {
        const rolSession = this.getSessionUser().rol;
        for (const rol of roles) {
            if (rolSession === rol) {
                return true;
            }
        }

        return false;
    }

    updateSessionUser(sessionUser?: any) {
        if (sessionUser) {
            this.updatedUser.next(sessionUser);
            localStorage.setItem('as_user', JSON.stringify(sessionUser));
        } else {
            this.updatedUser.next(false);
        }
        return true;
    }

    checkIp() {
        return this.http.get('https://jsonip.com')
            .subscribe( (data: any) => {
                this.ip = data.ip;
            });
    }
    getIp() {
        return this.ip;
    }
}
