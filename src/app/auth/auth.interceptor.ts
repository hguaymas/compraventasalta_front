
import {tap} from 'rxjs/operators';
import {Injectable, Injector} from '@angular/core';
import {HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from '@angular/common/http';
import {Observable} from 'rxjs';

import { Router } from '@angular/router';
import {AuthService} from './auth.service';
import {AlertMessageService} from '../shared/alerts/alert-message.service';



@Injectable()
export class AuthInterceptor implements HttpInterceptor {
    private _authService: AuthService;
    constructor(private inj: Injector, private router: Router, private _messageService: AlertMessageService) { }

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        this._authService = this.inj.get(AuthService);
        return next.handle(req).pipe(tap(event => { }, err => {
            if (err.error_original && err.error_original.name === 'TokenExpiredError') {
                this._authService.logout();
                this._messageService.handleMessage({title: 'Confirmación', message: 'Su sesión ha caducado, por favor, ingrese nuevamente'}, 'success');
                this.router.navigate(['/login']);
                return next.handle(req);
            } else if (err instanceof HttpErrorResponse && err.status === 403) {
                this.router.navigate(['/no-autorizado']);
            }
        }));
    }
}
