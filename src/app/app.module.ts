import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import {APP_BASE_HREF, CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

import { AppComponent } from './app.component';

import { AppRoutes } from './app.routing';

import {AdService} from './services/ad.service';
import {CategoryService} from './services/category.service';
import {AuthAdminGuard} from './auth/auth-admin.guard';
import {AuthService} from './auth/auth.service';
import {HTTP_INTERCEPTORS, HttpClientModule} from '@angular/common/http';
import {FrontendModule} from './frontend/frontend.module';
import {AdminModule} from './admin/admin.module';
import {AlertMessageService} from './shared/alerts/alert-message.service';
import {TokenInterceptor} from './auth/token.interceptor';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {Util} from './util';
import {FacebookModule} from 'ngx-facebook';
import {CityService} from './services/city.service';
import {UserService} from './services/user.service';
import {AuthInterceptor} from './auth/auth.interceptor';
import {Error403Component} from './auth/error403.component';
import {Error404Component} from './auth/error404.component';
import {AuthGuard} from './auth/auth.guard';
import {SessionGuard} from './auth/session.guard';
import {AdsenseModule} from 'ng2-adsense';
import {ScrollToModule} from '@nicky-lenaers/ngx-scroll-to';
import {MessageService} from './services/message.service';
import {Nl2BrPipeModule} from 'nl2br-pipe';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';



@NgModule({
    imports:      [
        CommonModule,
        BrowserModule,
        BrowserAnimationsModule,
        FormsModule,
        ReactiveFormsModule,
        RouterModule.forRoot(AppRoutes),
        HttpClientModule,
        FrontendModule,
        AdminModule,
        FacebookModule.forRoot(),
        AdsenseModule.forRoot(),
        ScrollToModule.forRoot(),
        Nl2BrPipeModule,
        NgbTooltipModule
    ],
    declarations: [
        AppComponent,
        Error403Component,
        Error404Component
    ],
    providers: [{
        provide: HTTP_INTERCEPTORS,
        useClass: AuthInterceptor,
        multi: true
    }, {
        provide: HTTP_INTERCEPTORS,
        useClass: TokenInterceptor,
        multi: true
    }, AdService, MessageService, AuthAdminGuard, AuthService, AlertMessageService, Util, CityService, UserService, AuthGuard, SessionGuard],
    bootstrap: [AppComponent]
})
export class AppModule { }
