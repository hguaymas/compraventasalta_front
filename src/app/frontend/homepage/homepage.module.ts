import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';


import { HomepageComponent } from './homepage.component';
import {HomepageService} from './homepage.service';
import {FacebookModule, FacebookService} from 'ngx-facebook';
import {AdsenseModule} from 'ng2-adsense';
import {PipesModule} from '../../shared/pipes/pipes.module';
import {MomentModule} from 'ngx-moment';
import {OwlModule} from 'ngx-owl-carousel';
import { TooltipModule } from 'primeng';

@NgModule({
    imports: [
        RouterModule,
        CommonModule,
        FormsModule,
        FacebookModule,
        AdsenseModule.forRoot(),
        PipesModule,
        MomentModule,
        OwlModule,
        TooltipModule
    ],
    declarations: [
        HomepageComponent
    ],
    providers: [
        HomepageService, FacebookService
    ]
})

export class HomepageModule {}
