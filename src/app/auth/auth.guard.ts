import { Injectable } from '@angular/core';
import {Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, NavigationEnd, Event, UrlSegment} from '@angular/router';
import {AuthService} from './auth.service';

@Injectable()
export class AuthGuard implements CanActivate {

    constructor(private router: Router, private _authService: AuthService) { }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        if (this._authService.isLoggedIn() && this._authService.hasRol('USER')) {
            // ESTA AUTENTICADO, VERIFICAR SI TIENE PERMISO PARA INGRESAR A LA PAGINA
            /*this.router.events.subscribe(event => {
                if (event instanceof NavigationEnd) {
                    const ruta = this.parseRoute(this.router.routerState.snapshot.root);
                    if(!this._authService.hasAccess(ruta)) {
                        this.router.navigate(['/no-autorizado']);
                        return false;
                    }
                }
            }); */
            return true;
        }
        // not logged in so redirect to auth page with the return url
        this.router.navigate(['/ingresar'], { queryParams: { returnUrl: state.url }});
        return false;
    }

    canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {

        if (localStorage.getItem('as_user_id') !== null && localStorage.getItem('as_token') !== null) {
            return true;
        }

        // not logged in so redirect to auth page with the return url
        this.router.navigate(['/ingresar'], { queryParams: { returnUrl: state.url }});
        return false;
    }

    parseRoute(node: ActivatedRouteSnapshot): string {
        if (node.firstChild) {
            return this.parseRoute(node.firstChild);
        }
        if (node.data['name'] && node.data['name'] != undefined) {
            return node.data['name'];
        }

    }

}
