
import {throwError as observableThrowError, Observable, BehaviorSubject} from 'rxjs';
import {Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse, HttpHeaders} from '@angular/common/http';
import {AlertMessageService} from '../shared/alerts/alert-message.service';
import {Ad} from '../models/ad.model';
import {Category} from '../models/category.model';
import {Util} from '../util';
import {AuthService} from '../auth/auth.service';
import {APPCONFIG} from '../config';
import {catchError, map} from 'rxjs/operators';
import {throwError} from 'rxjs/internal/observable/throwError';


@Injectable()
export class AdService {
    public viewType = 'list';
    searchTerm = '';
    public updatedTerm = new BehaviorSubject<any>(this.searchTerm);
    updatedTermObs = this.updatedTerm.asObservable();
    public adsList = [];
    public currentPage = 1;
    public currentUrl = '';

    constructor(
        private http: HttpClient,
        private _util: Util,
        private _alertMessageService: AlertMessageService,
        private _authService: AuthService
    ) {}

    toggleViewType() {
        this.viewType = this.viewType === 'list' ? 'grid' : 'list';
    }

    updateSearchTerm(searchTerm) {
        this.updatedTerm.next(searchTerm);
        return true;
    }

    getAds(city?: any, category?: any, subcategory?: any, queryParams?: any) {
        let params = '?1=1';
        if (category) {
            params += '&category=' + category._id;
        }
        if (subcategory) {
            params += '&subcategory=' + subcategory._id;
        }
        if (city) {
            params += '&city=' + city._id;
        }
        if (queryParams) {
            for (const param of queryParams) {
                params += '&' + param.name + '=' + param.value;
            }
        }
        return this.http.get(APPCONFIG.api_ads + params).pipe(
            map((response: Response) => {
                const ads = response;
                return ads;
            }),
            catchError((error: HttpErrorResponse) => {

                return observableThrowError(error);
            }), );

    }

    getMyAds(city?: any, category?: any, subcategory?: any, queryParams?: any): Observable<Array<any>> {
        let params = '?1=1';
        if (category) {
            params += '&category=' + category._id;
        }
        if (subcategory) {
            params += '&subcategory=' + subcategory._id;
        }
        if (city) {
            params += '&city=' + city._id;
        }
        if (queryParams) {
            for (const param of queryParams) {
                params += '&' + param.name + '=' + param.value;
            }
        }
        return this.http.get(APPCONFIG.api_ads + '/my-ads' + params)
            .pipe(
                map((ads: any[]) => ads),
                catchError((err: Response | any) => throwError(err.message))
            );
    }

    getAdsByUser(adId, city?: any, category?: any, subcategory?: any, queryParams?: any): Observable<Array<any>> {
        return this.http.get(APPCONFIG.api_ads + '/by-user/' + adId)
            .pipe(
                map((ads: any[]) => ads),
                catchError((err: Response | any) => throwError(err.message))
            );
    }

    getAdsPager(page: number, city?: any, category?: any, subcategory?: any, queryParams?: any) {
        let params = '?page=' + page;
        if (category) {
            params += '&category=' + category._id;
        }
        if (subcategory) {
            params += '&subcategory=' + subcategory._id;
        }
        if (city) {
            params += '&city=' + city._id;
        }
        if (queryParams) {
            for (const param of queryParams) {
                params += '&' + param.name + '=' + param.value;
            }
        }
        this.currentUrl = APPCONFIG.api_ads + '/pager/' + page + params;
        localStorage.setItem('currentUrl', this.currentUrl);
        return this.http.get(APPCONFIG.api_ads + '/pager/' + page + params).pipe(
            map((response: any) => {
                const result = response;
                this.adsList = result.docs;
                return {
                    ads: result.docs,
                    totalItems: result.total,
                    currentPage: result.page,
                    pageSize: result.limit,
                    totalPages: result.pages
                };
            }),
            catchError((error: HttpErrorResponse) => {

                return observableThrowError(error);
            }), );

    }

    getLatestAds() {
        this.currentUrl = APPCONFIG.api_ads + '/pager?page=1';
        localStorage.setItem('currentUrl', this.currentUrl);
        return this.http.get(APPCONFIG.api_ads + '/latest').pipe(
            map((response: any) => {
                const result = response;
                return result;
            }),
            catchError((error: HttpErrorResponse) => {

                return observableThrowError(error);
            }), );
    }

    getAdBySlug(adSlug: string) {
        const url = localStorage.getItem('currentUrl');
        let param = '';
        if (url) {
            param = '?url=' + url.replace(/&/gi, '%amp%');
        }
        return this.http.get(APPCONFIG.api_ads + '/by-slug/' + adSlug + param).pipe(
            map((response: Response) => {

                return response;
            }),
            catchError((error: HttpErrorResponse) => {

                return observableThrowError(error);
            }), );

    }

    getRelatedAds(id, page?, size?) {
        return this.http.get(APPCONFIG.api_ads + '/relatedAds/' + id).pipe(
            map((response: any) => {
                const total = response.hits.total;
                const pagesList = [];
                const pagesQuantity = Math.ceil(total / size);
                for (let i = 1; i <= pagesQuantity; i++) {
                    pagesList.push(i);
                }
                const ads = response.hits.hits.map((hits) => hits._source);
                return {
                    response: ads,
                    totalItems: total,
                    currentPage: page,
                    pageSize: size,
                    totalPages: pagesQuantity,
                    pages: pagesList
                };
            }),
            catchError((error: HttpErrorResponse) => {
                return observableThrowError(error);
            }), );
    }

    getAdById(adId: string) {
        return this.http.get(APPCONFIG.api_ads + '/' + adId).pipe(
            map((response: Response) => {

                return response;
            }),
            catchError((error: HttpErrorResponse) => {
                return observableThrowError(error);
            }), );

    }

    reportAd(reason, email, message, adId) {
        const body = JSON.stringify({
            reason: reason,
            email: email,
            message: message,
            adId: adId
        });
        const headers = new HttpHeaders({'Content-Type': 'application/json'});
        return this.http.post(APPCONFIG.api_ads + '/report-ad', body, {headers: headers}).pipe(
            map((response: any) => response),
            catchError((error: HttpErrorResponse) => {

                this._alertMessageService.handleMessage(error.message, 'error');
                return observableThrowError(error);
            }), );
    }

    createAd(ad: Ad, images?): Observable<Ad> {

        const formData = this._util.createFormData(ad);

        if (images && images.length > 0) {
            for (let i = 0; i < images.length; i++) {
                formData.append('image[' + i + ']', images[i].file, images[i].file.name);
                formData.append('principal[' + i + ']', images[i].principal);
            }
        }
        return this.http.post(APPCONFIG.api_ads, formData).pipe(
            map((response: any) =>  {
                return response;
            }),
            catchError((error: HttpErrorResponse) => {
                this._alertMessageService.handleMessage(error.message, 'error');
                return observableThrowError(error);
            }), );
    }

    updateAd(ad: Ad, adImages, images?, removedImages?): Observable<Ad> {

        const formData = this._util.createFormData(ad);

        if (images && images.length > 0) {
            for (let i = 0; i < images.length; i++) {
                formData.append('image[' + i + ']', images[i].file, images[i].file.name);
                formData.append('principal[' + i + ']', images[i].principal);
            }
        }
        if (removedImages && removedImages.length > 0) {
            for (let i = 0; i < removedImages.length; i++) {
                formData.append('removedImages[' + i + ']', JSON.stringify(removedImages[i]));
            }
        }

        if (adImages && adImages.length > 0) {
            for (let i = 0; i < adImages.length; i++) {
                formData.append('adImages[' + i + ']', JSON.stringify(adImages[i]));
                formData.append('principal[' + i + ']', adImages[i].principal);
            }
        }
        return this.http.put(APPCONFIG.api_ads + '/' + ad._id, formData).pipe(
            map((response: any) =>  {

                return response;
            }),
            catchError((error: HttpErrorResponse) => {

                this._alertMessageService.handleMessage(error.message, 'error');
                return observableThrowError(error);
            }), );
    }

    deleteAd(adId) {
        return this.http.delete(APPCONFIG.api_ads + '/' + adId).pipe(
            map((response: any) => {
                return response;
            }),
            catchError((error: HttpErrorResponse) => {
                this._alertMessageService.handleMessage(error.message, 'error');
                return observableThrowError(error);
            }), );
    }

    changeAdStatus(adId, status): Observable<Ad> {
        const body = JSON.stringify({
            status: status
        });
        const headers = new HttpHeaders({'Content-Type': 'application/json'});
        return this.http.put(APPCONFIG.api_ads + '/' + adId + '/change-status', body, {headers: headers}).pipe(
            map((response: any) =>  {

                return response;
            }),
            catchError((error: HttpErrorResponse) => {

                this._alertMessageService.handleMessage(error.message, 'error');
                return observableThrowError(error);
            }), );
    }

    sendMessage(adId, message) {
        const body = JSON.stringify({
            message: message,
            adId: adId
        });
        const headers = new HttpHeaders({'Content-Type': 'application/json'});
        return this.http.post(APPCONFIG.api_ads + '/send-message', body, {headers: headers}).pipe(
            map((response: any) => response),
            catchError((error: HttpErrorResponse) => {

                this._alertMessageService.handleMessage(error.message, 'error');
                return observableThrowError(error);
            }), );
    }

    searchAds(term, page, queryParams?) {

        const from = page * APPCONFIG.pageSize - APPCONFIG.pageSize;
        const size = APPCONFIG.pageSize;
        let params = '&from=' + from + '&size=' + size;
        if (queryParams) {
            for (const param of queryParams) {
                params += '&' + param.name + '=' + param.value;
            }
        }
        const headers = new HttpHeaders({'Content-Type': 'application/json'});
        this.currentUrl = APPCONFIG.api_ads + '/search?q=' + term + params;
        localStorage.setItem('currentUrl', this.currentUrl);
        return this.http.get(APPCONFIG.api_ads + '/search?q=' + term + params).pipe(
            map((response: any) => {
                const total = response.hits.total;
                const pagesList = [];
                const pagesQuantity = Math.ceil(total / size);
                for (let i = 1; i <= pagesQuantity; i++) {
                    pagesList.push(i);
                }
                const ads = response.hits.hits.map((hits) => hits._source);
                return {
                    ads: ads,
                    response: response,
                    totalItems: total,
                    currentPage: page,
                    pageSize: size,
                    totalPages: pagesQuantity,
                    pages: pagesList
                };
            }),
            catchError((error: HttpErrorResponse) => {

                this._alertMessageService.handleMessage(error.message, 'error');
                return observableThrowError(error);
            }), );
    }

    getPreviousNext(currentAd) {
        let i = 0;
        let prev, next;
        const adLength = this.adsList.length;
        if (adLength > 0) { // proviene de un listado o busqueda
            for (const ad of this.adsList) {
                if (ad._id === currentAd._id) {
                    if (i > 0) { // el aviso no esta en primer lugar
                       prev = this.adsList[i - 1];
                       if (i === (adLength - 1)) {
                          // Tengo que obtener la URL hacia la API que obtiene la siguiente pagina
                       } else {
                           next = this.adsList[i + 1];
                       }
                    } else if (i === 0) { // el aviso esta en primer lugar
                        prev = null;
                        next = i + 1;
                    }
                    break;
                }
                i++;
            }
        }
        return [prev, next];
    }



}
