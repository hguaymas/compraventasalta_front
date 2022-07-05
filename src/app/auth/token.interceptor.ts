import {Injectable, Injector} from '@angular/core';
import {HttpEvent, HttpInterceptor, HttpHandler, HttpRequest} from '@angular/common/http';
import {Observable} from 'rxjs';
import {AuthService} from './auth.service';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {
    private _auth: AuthService;

    constructor(private inj: Injector) {}

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        this._auth = this.inj.get(AuthService);
        // Obtenemos el token
        const token = this._auth.getToken();
        if (token) {
            if (req.url != 'https://jsonip.com') {
                // Importante: modificamos de forma inmutable, haciendo el clonado de la petición
                const request = req.clone({headers: req.headers.set('Authorization', token)});
                // Pasamos al siguiente interceptor de la cadena la petición modificada
                return next.handle(request);
            }
        }
        return next.handle(req);
    }
}
