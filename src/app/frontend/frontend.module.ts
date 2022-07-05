import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FrontendRoutes } from './frontend.routing';
import {AdListingComponent} from './ads/listings/ads-listings.component';
import {HomepageService} from './homepage/homepage.service';
import {AdCreateComponent} from './ads/create/ads-create.component';
import {LoginComponent} from './login/login.component';
import {HomepageModule} from './homepage/homepage.module';
import {FooterFrontendComponent} from './shared/footer/footer-frontend.component';
import {HeaderFrontendComponent} from './shared/header/header-frontend.component';
import {NewsletterComponent} from './shared/newsletter/newsletter.component';
import {FrontendLayoutComponent} from './layout/frontend-layout.component';
import {BreadcrumbsFrontendComponent} from './shared/breadcrumbs/breadcrumbs-frontend.component';
import {AdDetailComponent} from './ads/detail/ad-detail.component';
import {FacebookModule, FacebookService} from 'ngx-facebook';
import {LoginModalComponent} from './login/login-modal.component';
import {AdService} from '../services/ad.service';
import {OwlModule} from 'ngx-owl-carousel';
import {AdSearchComponent} from './ads/search/ads-search.component';
import {SearchMenuComponent} from './ads/search/search-menu.component';
import {AdsenseModule} from 'ng2-adsense';
import {MomentModule} from 'ngx-moment';
import {CapitalizePipe} from '../shared/pipes/capitalize.pipe';
import {TermsConditionsComponent} from './static/terms-conditions.component';
import {environment} from '../../environments/environment';
import {
    RECAPTCHA_LANGUAGE, RECAPTCHA_SETTINGS, RecaptchaFormsModule, RecaptchaLoaderService, RecaptchaModule,
    RecaptchaSettings
} from 'ng-recaptcha';
import {AccountActivationComponent} from '../auth/account-activation.component';
import {RecoverPasswordComponent} from './login/recover-password.component';
import {Nl2BrPipeModule} from 'nl2br-pipe';
import {PipesModule} from '../shared/pipes/pipes.module';
import {ContactComponent} from './static/contact.component';
import {ContactFormComponent} from './static/contact-form.component';
import {BlockUIModule as BlockUIModule2} from 'ng-block-ui';
import {Title} from '@angular/platform-browser';
import {ScrollToService} from '@nicky-lenaers/ngx-scroll-to';
import {ScriptService} from '../services/script.service';
import {AdListingFilterComponent} from './ads/shared/filters/ads-listing-filter.component';
import { NgxGalleryModule } from '@kolkov/ngx-gallery';
import { BlockUIModule, TooltipModule } from 'primeng';

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(FrontendRoutes),
        FormsModule,
        ReactiveFormsModule,
        HomepageModule,
        TooltipModule,
        NgxGalleryModule,
        OwlModule,
        AdsenseModule.forRoot(),
        MomentModule,
        RecaptchaModule,
        RecaptchaFormsModule,
        Nl2BrPipeModule,
        PipesModule,
        BlockUIModule,
        BlockUIModule2.forRoot(),
        FacebookModule
    ],
    declarations: [
        FrontendLayoutComponent,
        AdListingComponent,
        LoginComponent,
        FooterFrontendComponent,
        HeaderFrontendComponent,
        NewsletterComponent,
        BreadcrumbsFrontendComponent,
        AdDetailComponent,
        AdCreateComponent,
        LoginModalComponent,
        AdSearchComponent,
        SearchMenuComponent,
        TermsConditionsComponent,
        AccountActivationComponent,
        RecoverPasswordComponent,
        ContactComponent,
        ContactFormComponent,
        AdListingFilterComponent
    ],
    providers: [
        HomepageService, AdService, FacebookService, RecaptchaLoaderService, Title, ScrollToService, ScriptService,
        {
            provide: RECAPTCHA_SETTINGS,
            useValue: { siteKey: environment.RECAPTCHA_KEY } as RecaptchaSettings,
        }, {
            provide: RECAPTCHA_LANGUAGE,
            useValue: 'es', // use French language
        }
    ]
})
export class FrontendModule {}
