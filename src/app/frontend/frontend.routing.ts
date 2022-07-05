import { Routes } from '@angular/router';

import { HomepageComponent } from './homepage/homepage.component';
import {AdListingComponent} from './ads/listings/ads-listings.component';
import {AdCreateComponent} from './ads/create/ads-create.component';
import {LoginComponent} from './login/login.component';
import {FrontendLayoutComponent} from './layout/frontend-layout.component';
import {AdDetailComponent} from './ads/detail/ad-detail.component';
import {Error404Component} from '../auth/error404.component';
import {Error403Component} from '../auth/error403.component';
import {SessionGuard} from '../auth/session.guard';
import {AdSearchComponent} from './ads/search/ads-search.component';
import {TermsConditionsComponent} from './static/terms-conditions.component';
import {AccountActivationComponent} from '../auth/account-activation.component';
import {RecoverPasswordComponent} from './login/recover-password.component';
import {ContactComponent} from './static/contact.component';

export const FrontendRoutes: Routes = [
    {
        path: '',
        component: FrontendLayoutComponent,
        children: [
            { path: '', component: HomepageComponent, pathMatch: 'full' },
            { path: 'terminos-condiciones', component: TermsConditionsComponent },
            { path: 'contacto-ayuda', component: ContactComponent },
            { path: 'account_activation/:user/:token', component: AccountActivationComponent },
            { path: 'ingresar', component: LoginComponent },
            { path: 'registrarse', component: LoginComponent },
            { path: 'recuperar-password', component: LoginComponent },
            { path: 'recuperar-clave/:user/:token', component: RecoverPasswordComponent },
            { path: 'crear-anuncio', component: AdCreateComponent },
            { path: 'buscar', component: AdSearchComponent },
            { path: 'anuncio/:adSlug', component: AdDetailComponent },
            { path: 'anuncios/todas-las-categorias/:citySlug', component: AdListingComponent },
            { path: 'anuncios/todas-las-categorias', component: AdListingComponent },
            { path: 'anuncios/:categorySlug/:citySlug', component: AdListingComponent },
            { path: 'anuncios/:categorySlug', component: AdListingComponent },
            { path: 'anuncios', component: AdListingComponent },
            { path: 'no-autorizado', component: Error403Component },
            { path: '404', component: Error404Component },
        ],
    }
];
