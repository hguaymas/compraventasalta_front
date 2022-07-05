
import {throwError as observableThrowError, Observable} from 'rxjs';

import {catchError, map} from 'rxjs/operators';
import {Injectable} from '@angular/core';
import {APPCONFIG} from '../config';
import {HttpClient, HttpErrorResponse, HttpHeaders} from '@angular/common/http';
import {User} from '../models/user.model';
import {AlertMessageService} from '../shared/alerts/alert-message.service';
import * as objectToFormData from 'object-to-formdata';
import {Util} from '../util';


@Injectable()
export class UserService {
    constructor(private http: HttpClient, private _alertMessageService: AlertMessageService, private _util: Util) {
    }

    getUser(userId?: string) {
        return this.http.get(APPCONFIG.api_users + '/' + userId).pipe(
            map((response) => {

                return response;
            }),
            catchError((error: HttpErrorResponse) => {
                return observableThrowError(error);
            }));

    }

    getUsers() {
        return this.http.get(APPCONFIG.api_users).pipe(
            map((response: any) => {
                const users = response;
                return users;
            }),
            catchError((error: HttpErrorResponse) => {
                return observableThrowError(error);
            }));

    }

    createUser(user: User, photo?): Observable<User> {
        const formData = this._util.createFormData(user);
        if (photo && typeof photo === 'object') {
            formData.append('photo', photo, photo.name);
        }
        return this.http.post(APPCONFIG.api_users, formData).pipe(
            map((response: any) =>  {
                return response;
            }),
            catchError((error: HttpErrorResponse) => {
                this._alertMessageService.handleMessage(error.message, 'error');
                return observableThrowError(error);
            }));
    }

    updateUser(user: User) {
        const body = JSON.stringify(user);
        const headers = new HttpHeaders({'Content-Type': 'application/json'});
        return this.http.put(APPCONFIG.api_users + '/' + user._id, body, {headers: headers}).pipe(
            map((response: any) => {
                const result = response;

                return result;
            }),
            catchError((error: HttpErrorResponse) => {
                this._alertMessageService.handleMessage(error.message, 'error');
                return observableThrowError(error);
            }));
    }

    updateUserPhoto(userId, photo?, photoChanged?) {
        const formData = new FormData();


        if (photo && photoChanged) {
            formData.append('photo', photo, photo.name);
            formData.append('photoChanged', photoChanged);
        } else {
            formData.append('photoChanged', photoChanged);
        }
        return this.http.put(APPCONFIG.api_users + '/photo/' + userId, formData).pipe(
            map((response: any) => {
                const result = response;

                return result;
            }),
            catchError((error: HttpErrorResponse) => {
                this._alertMessageService.handleMessage(error.message, 'error');
                return observableThrowError(error);
            }));
    }

    updateContactInfo(obj: any, user_id: string) {
        const body = JSON.stringify(obj);
        const headers = new HttpHeaders({'Content-Type': 'application/json'});
        return this.http.put(APPCONFIG.api_users + '/' + user_id, body, {headers: headers}).pipe(
            map((response: any) => {
                const result = response;

                return result;
            }),
            catchError((error: HttpErrorResponse) => {
                this._alertMessageService.handleMessage(error.message, 'error');
                return observableThrowError(error);
            }));
    }

    deleteUser(user: any) {
        return this.http.delete(APPCONFIG.api_users + '/' + user._id).pipe(
            map((response: any) => {
                return response;
            }),
            catchError((error: HttpErrorResponse) => {
                this._alertMessageService.handleMessage(error.message, 'error');
                return observableThrowError(error);
            }));
    }

    registerUser(user: User): Observable<User> {
        const body = JSON.stringify(user);
        const headers = new HttpHeaders({'Content-Type': 'application/json'});
        return this.http.post(APPCONFIG.api_users + '/register', body, {headers: headers}).pipe(
            map((response: any) =>  {
                return response;
            }),
            catchError((error: HttpErrorResponse) => {
                this._alertMessageService.handleMessage(error.message, 'error');
                return observableThrowError(error);
            }));
    }

    changePassword(user, oldPassword: string, newPassword: string) {
        const body = JSON.stringify({
            user: user,
            oldPassword: oldPassword,
            newPassword: newPassword
        });
        const headers = new HttpHeaders({'Content-Type': 'application/json'});
        return this.http.put(APPCONFIG.api_users + '/change_password', body, {headers: headers}).pipe(
            map((response: any) => response),
            catchError((error: HttpErrorResponse) => {

                this._alertMessageService.handleMessage(error.error.message, 'error');
                return observableThrowError(error);
            }));
    }

    updateRequestedPassword(user: string, token: string, newPassword: string) {
        const body = JSON.stringify({
            user: user,
            token: token,
            newPassword: newPassword
        });
        const headers = new HttpHeaders({'Content-Type': 'application/json'});
        return this.http.put(APPCONFIG.api_update_requested_password, body, {headers: headers}).pipe(
            map((response: any) => response),
            catchError((error: HttpErrorResponse) => {

                this._alertMessageService.handleMessage(error.error.message, 'error');
                return observableThrowError(error);
            }));
    }
}
