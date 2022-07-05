
import {throwError as observableThrowError, Observable, BehaviorSubject} from 'rxjs';

import {catchError, map} from 'rxjs/operators';
import {Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse, HttpHeaders} from '@angular/common/http';
import {AlertMessageService} from '../shared/alerts/alert-message.service';
import {Ad} from '../models/ad.model';
import {Category} from '../models/category.model';
import {Util} from '../util';
import {AuthService} from '../auth/auth.service';
import {APPCONFIG} from '../config';


@Injectable()
export class MessageService {

    constructor(
        private http: HttpClient,
        private _util: Util,
        private _alertMessageService: AlertMessageService,
        private _authService: AuthService
    ) {}

    sendContactMessage(messageObj) {
        const body = JSON.stringify(messageObj);
        const headers = new HttpHeaders({'Content-Type': 'application/json'});
        return this.http.post(APPCONFIG.api_messages + '/contact', body, {headers: headers}).pipe(
            map((response: any) => response),
            catchError((error: HttpErrorResponse) => {

                this._alertMessageService.handleMessage(error.message, 'error');
                return observableThrowError(error);
            }), );
    }

    sendMessage(adId, message) {
        const body = JSON.stringify({
            message: message,
            adId: adId
        });
        const headers = new HttpHeaders({'Content-Type': 'application/json'});
        return this.http.post(APPCONFIG.api_messages, body, {headers: headers}).pipe(
            map((response: any) => response),
            catchError((error: HttpErrorResponse) => {

                this._alertMessageService.handleMessage(error.message, 'error');
                return observableThrowError(error);
            }), );
    }

    markAsReaded(userFromId, adId) {
        const body = JSON.stringify({
            userFromId: userFromId,
            adId: adId
        });
        const headers = new HttpHeaders({'Content-Type': 'application/json'});
        return this.http.post(APPCONFIG.api_messages + '/mark-as-readed', body, {headers: headers}).pipe(
            map((response: any) => response),
            catchError((error: HttpErrorResponse) => {

                this._alertMessageService.handleMessage(error.message, 'error');
                return observableThrowError(error);
            }), );
    }

    markAsReadedSent(userToId, adId) {
        const body = JSON.stringify({
            userToId: userToId,
            adId: adId
        });
        const headers = new HttpHeaders({'Content-Type': 'application/json'});
        return this.http.post(APPCONFIG.api_messages + '/mark-as-readed-sent', body, {headers: headers}).pipe(
            map((response: any) => response),
            catchError((error: HttpErrorResponse) => {

                this._alertMessageService.handleMessage(error.message, 'error');
                return observableThrowError(error);
            }), );
    }

    replyMessage(adId, userTo, message) {
        const body = JSON.stringify({
            message: message,
            userTo: userTo,
            adId: adId
        });
        const headers = new HttpHeaders({'Content-Type': 'application/json'});
        return this.http.post(APPCONFIG.api_messages + '/reply', body, {headers: headers}).pipe(
            map((response: any) => response),
            catchError((error: HttpErrorResponse) => {

                this._alertMessageService.handleMessage(error.error.message, 'error');
                return observableThrowError(error);
            }), );
    }

    replyMessageSent(adId, userTo, message) {
        const body = JSON.stringify({
            message: message,
            userTo: userTo,
            adId: adId
        });
        const headers = new HttpHeaders({'Content-Type': 'application/json'});
        return this.http.post(APPCONFIG.api_messages + '/reply-sent', body, {headers: headers}).pipe(
            map((response: any) => response),
            catchError((error: HttpErrorResponse) => {

                this._alertMessageService.handleMessage(error.error.message, 'error');
                return observableThrowError(error);
            }), );
    }

    getMessages() {
        return this.http.get(APPCONFIG.api_messages).pipe(
            map((response: any) => {
                return response;
            }),
            catchError((error: HttpErrorResponse) => {
                this._alertMessageService.handleMessage(error.message, 'error');
                return observableThrowError(error);
            }), );

    }

    getSentMessages() {
        return this.http.get(APPCONFIG.api_messages + '/sent').pipe(
            map((response: any) => {
                return response;
            }),
            catchError((error: HttpErrorResponse) => {
                this._alertMessageService.handleMessage(error.message, 'error');
                return observableThrowError(error);
            }), );

    }

}
