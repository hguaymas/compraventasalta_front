import { Routes } from '@angular/router';

import {BackendLayoutComponent} from './layout/backend-layout.component';
import {AdListComponent} from './ads/ads-list.component';
import {AdEditComponent} from './ads/ads-edit.component';
import {MyProfileComponent} from './profile/my-profile.component';
import {MyMessagesComponent} from './messages/my-messages.component';
import {SentMessagesComponent} from './messages/sent-messages.component';


export const BackendRoutes: Routes = [
    {
        path: '',
        component: BackendLayoutComponent,
        children: [
            { path: '', redirectTo: 'mis-avisos', pathMatch: 'full' },
            { path: 'mis-avisos/editar/:adId', component: AdEditComponent },
            { path: 'mis-mensajes', redirectTo: 'mis-mensajes/recibidos', pathMatch: 'full' },
            { path: 'mis-mensajes/recibidos', component: MyMessagesComponent },
            { path: 'mis-mensajes/enviados', component: SentMessagesComponent },
            { path: 'mis-avisos', component: AdListComponent },
            { path: 'mi-perfil', component: MyProfileComponent },
        ],
    }

];
