import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BackendRoutes } from './backend.routing';
import {FooterBackendComponent} from './shared/footer/footer-backend.component';
import {HeaderBackendComponent} from './shared/header/header-backend.component';
import {BackendLayoutComponent} from './layout/backend-layout.component';
import {BreadcrumbsBackendComponent} from './shared/breadcrumbs/breadcrumbs-backend.component';
import {FacebookModule, FacebookService} from 'ngx-facebook';
import {OwlModule} from 'ngx-owl-carousel';
import {AdListComponent} from './ads/ads-list.component';
import {AdService} from '../services/ad.service';
import {AdEditComponent} from './ads/ads-edit.component';
import {MyMessagesComponent} from './messages/my-messages.component';
import {Nl2BrPipeModule} from 'nl2br-pipe';
import {BlockUIModule as BlockUIModule2} from 'ng-block-ui';
import {SearchMessagePipe} from './messages/search-message.pipe';
import {NotificationService} from '../services/notification.service';
import {PipesModule} from '../shared/pipes/pipes.module';
import {MomentModule} from 'ngx-moment';
import {SentMessagesComponent} from './messages/sent-messages.component';
import {ImageCropperModule} from 'ngx-img-cropper';
import { NgxGalleryModule } from '@kolkov/ngx-gallery';
import { BlockUIModule, PanelModule, TableModule, TooltipModule} from 'primeng';
import { MyProfileComponent } from './profile/my-profile.component';


@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(BackendRoutes),
        FormsModule,
        ReactiveFormsModule,
        TooltipModule,
        NgxGalleryModule,
        OwlModule,
        TableModule,
        Nl2BrPipeModule,
        BlockUIModule,
        PanelModule,
        BlockUIModule2,
        PipesModule,
        MomentModule,
        ImageCropperModule
    ],
    declarations: [
        AdListComponent,
        AdEditComponent,
        FooterBackendComponent,
        HeaderBackendComponent,
        BackendLayoutComponent,
        BreadcrumbsBackendComponent,
        MyProfileComponent,
        MyMessagesComponent,
        SentMessagesComponent,
        SearchMessagePipe
    ],
    providers: [
        AdService, FacebookService, NotificationService
    ]
})
export class BackendModule {}
