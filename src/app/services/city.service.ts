
import {throwError as observableThrowError, Observable, Subject} from 'rxjs';

import {catchError, map} from 'rxjs/operators';
import {Injectable} from '@angular/core';
import {APPCONFIG} from '../config';
import {HttpClient, HttpErrorResponse, HttpHeaders} from '@angular/common/http';
import {City} from '../models/city.model';
import {AlertMessageService} from '../shared/alerts/alert-message.service';
import * as objectToFormData from 'object-to-formdata';
import {Util} from '../util';


@Injectable()
export class CityService {

    cityListObs = new Subject<any[]>();
    cityListStatus$ = this.cityListObs.asObservable();

    constructor(private http: HttpClient, private _alertMessageService: AlertMessageService, private _util: Util) {
    }

    updateCityListStatus(cities: any[]) {
        this.cityListObs.next(cities);
    }

    getCity(catId?: string) {
        return this.http.get(APPCONFIG.api_cities + '/' + catId).pipe(
            map((response) => {

                return response;
            }),
            catchError((error: HttpErrorResponse) => {
                return observableThrowError(error);
            }), );

    }

    getCities() {
        return this.http.get(APPCONFIG.api_cities).pipe(
            map((response: any) => {
                const cities = response;
                return cities;
            }),
            catchError((error: HttpErrorResponse) => {
                return observableThrowError(error);
            }), );

    }

    getCitiesCountAds(category?, subcategory?) {
        let queryString = '?filter=1';
        if (category) {
            queryString += '&category=' + category._id
        }
        if (subcategory) {
            queryString += '&subcategory=' + subcategory._id
        }
        return this.http.get(APPCONFIG.api_cities + '/listCitiesCountAds' + queryString).pipe(
            map((response: any) => {
                return response;
            }),
            catchError((error: HttpErrorResponse) => {
                return observableThrowError(error);
            }), );

    }

    createCity(city: City, icon?): Observable<City> {
        const formData = this._util.createFormData(city);
        if (icon && typeof icon === 'object') {
            formData.append('icon', icon, icon.name);
        }
        return this.http.post(APPCONFIG.api_cities, formData).pipe(
            map((response: any) =>  {
                return response;
            }),
            catchError((error: HttpErrorResponse) => {
                this._alertMessageService.handleMessage(error.message, 'error');
                return observableThrowError(error);
            }), );
    }

    updateCity(city: City, icon, iconChanged) {

        const formData = this._util.createFormData(city);
        if (icon && iconChanged) {
            formData.append('icon', icon, icon.name);
            formData.append('iconChanged', iconChanged);
        } else {
            formData.append('iconChanged', iconChanged);
        }
        return this.http.put(APPCONFIG.api_cities + '/' + city._id, formData).pipe(
            map((response: any) => {
                const result = response;

                return result;
            }),
            catchError((error: HttpErrorResponse) => {
                this._alertMessageService.handleMessage(error.message, 'error');
                return observableThrowError(error);
            }), );
    }

    deleteCity(city: any) {
        return this.http.delete(APPCONFIG.api_cities + '/' + city._id).pipe(
            map((response: any) => {
                return response;
            }),
            catchError((error: HttpErrorResponse) => {
                this._alertMessageService.handleMessage(error.message, 'error');
                return observableThrowError(error);
            }), );
    }

    getCityBySlug(slug: string) {
        return this.http.get(APPCONFIG.api_cities + '/by_slug/' + slug).pipe(
            map((response) => {

                return response;
            }),
            catchError((error: HttpErrorResponse) => {
                return observableThrowError(error);
            }), );

    }
}
