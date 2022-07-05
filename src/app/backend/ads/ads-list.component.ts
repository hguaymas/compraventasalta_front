import {AfterViewInit, Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {AdService} from '../../services/ad.service';
import {APPCONFIG} from '../../config';
import {Category} from '../../models/category.model';
import {Location, LocationStrategy, PlatformLocation} from '@angular/common';
import swal from 'sweetalert2';
import {AlertMessageService} from '../../shared/alerts/alert-message.service';

declare var $: any;

@Component({
    selector: 'app-ads-list',
    templateUrl: './ads-list.component.html',
    styles: [`
        :host::ng-deep .ui-widget-header {
            background: #ffffff;
            color: #2d353c;
            border: 0px;
        }
    `]
    // styleUrls: ['../../../../assets/css/backend-layout.component.css']
})
export class AdListComponent implements OnInit, AfterViewInit {

    ads: Array<any> = [];
    loading = false;
    config;
    constructor(public activatedRoute: ActivatedRoute,
                public router: Router,
                private url: LocationStrategy,
                private location: PlatformLocation,
                public _adService: AdService,
                private _alertMessageService: AlertMessageService
                ) {
        this.config = APPCONFIG;
    }

    ngOnInit() {
        this.getAds();
    }

    getAds(city?, category?, subcategory?) {
        this.loading = true;
        this._adService.getMyAds(city, category, subcategory)
            .subscribe(
                ads => {
                    this.ads = ads;
                    this.loading = false;
                }
            );
    }

    ngAfterViewInit() {
        // SCROLLBARS
        setTimeout(() => {
            if ($('.tg-verticalscrollbar').length > 0) {
                const _tg_verticalscrollbar = $('.tg-verticalscrollbar');
                _tg_verticalscrollbar.mCustomScrollbar({
                    axis: 'y',
                    scrollInertia: 250
                });
            }
            if ($('.tg-horizontalthemescrollbar').length > 0) {
                const _tg_horizontalthemescrollbar = $('.tg-horizontalthemescrollbar');
                _tg_horizontalthemescrollbar.mCustomScrollbar({
                    axis: 'x',
                    advanced: {autoExpandHorizontalScroll: true},
                });
            }
        }, 10);
    }

    hideAd(adId) {
        swal.fire({
            buttonsStyling: false,
            focusConfirm: false,
            allowEnterKey: false,
            title: 'Ocultar Aviso',
            text: '¿Está seguro de querer ocultar el Aviso?',
            type: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Si, ocultar',
            cancelButtonText: 'Cancelar',
            confirmButtonClass: 'btn btn-warning mr-10',
            cancelButtonClass: 'btn btn-default'
        }).then(() => {
            this._adService.changeAdStatus(adId, 'HIDDEN')
                .subscribe(
                    result => {
                        this.updateList(result);
                        this._alertMessageService.handleMessage('Se ocultó tu anuncio correctamente', 'success');
                    }
                );
        })
            .catch(() => console.log('Ocultación cancelada'));
    }

    showAd(adId) {
        swal.fire({
            buttonsStyling: false,
            focusConfirm: false,
            allowEnterKey: false,
            title: 'Mostrar Aviso',
            text: '¿Está seguro de querer mostrar nuevamente el Aviso?',
            type: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Si, mostrar',
            cancelButtonText: 'Cancelar',
            confirmButtonClass: 'btn btn-warning mr-10',
            cancelButtonClass: 'btn btn-default'
        }).then(() => {
            this._adService.changeAdStatus(adId, 'SHOW')
                .subscribe(
                    result => {
                        this.updateList(result);
                        this._alertMessageService.handleMessage('El anuncio se encuentra visible nuevamente', 'success');
                    }
                );
        })
            .catch(() => console.log('Ocultación cancelada'));
    }

    finishAd(adId) {
        swal.fire({
            buttonsStyling: false,
            focusConfirm: false,
            allowEnterKey: false,
            title: 'Finalizar Aviso',
            html: '¿Está seguro de querer finalizar el Aviso?. El anuncio aparecerá como Finalizado o Vendido.<br/>Esta operación no se podrá deshacer.' ,
            type: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Si, finalizar',
            cancelButtonText: 'Cancelar',
            confirmButtonClass: 'btn btn-warning mr-10',
            cancelButtonClass: 'btn btn-default'
        }).then(() => {
            this._adService.changeAdStatus(adId, 'FINISHED')
                .subscribe(
                    result => {
                        this.updateList(result);
                        this._alertMessageService.handleMessage('Se finalizó el anuncio correctamente!', 'success');
                    }
                );
        })
            .catch(() => console.log('Finalización cancelada'));
    }

    republishAd(adId, adStatus) {
        swal.fire({
            buttonsStyling: false,
            focusConfirm: false,
            allowEnterKey: false,
            title: 'Re-publicar Aviso',
            html: '¿Confirma re-publicación del Aviso?' ,
            type: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Si, re-publicar',
            cancelButtonText: 'Cancelar',
            confirmButtonClass: 'btn btn-warning mr-10',
            cancelButtonClass: 'btn btn-default'
        }).then(() => {
            this._adService.changeAdStatus(adId, 'REPUBLISHED')
                .subscribe(
                    result => {
                        this.updateList(result);
                        this._alertMessageService.handleMessage('Se re-publicó el anuncio correctamente!', 'success');
                    }
                );
        })
            .catch(() => console.log('Republicación cancelada'));
    }

    deleteAd(adId) {
        swal.fire({
            buttonsStyling: false,
            focusConfirm: false,
            allowEnterKey: false,
            title: 'Eliminar Aviso',
            html: '¿Está seguro de querer eliminar el Aviso?. <br/>Esta operación no se podrá deshacer.' ,
            type: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Si, eliminar',
            cancelButtonText: 'Cancelar',
            confirmButtonClass: 'btn btn-warning mr-10',
            cancelButtonClass: 'btn btn-default'
        }).then(() => {
            this.loading = true;
            this._adService.deleteAd(adId)
                .subscribe(
                    result => {
                        this.getAds();
                        this.loading = false;
                        this._alertMessageService.handleMessage('Se eliminó el anuncio correctamente!', 'success');
                    }
                );
        })
            .catch(() => {
                this.loading = false;
                console.log('Finalización cancelada');
            })
    }

    updateList(updatedAd) {
        for (let i = 0; i < this.ads.length; i++) {
            if (this.ads[i]._id === updatedAd._id) {
                this.ads[i] = updatedAd;
                break;
            }
        }
    }
}
