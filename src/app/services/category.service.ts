
import {throwError as observableThrowError, Observable, Subject} from 'rxjs';

import {catchError, map} from 'rxjs/operators';
import {Injectable} from '@angular/core';
import {APPCONFIG} from '../config';
import {HttpClient, HttpErrorResponse, HttpHeaders} from '@angular/common/http';
import {Category} from '../models/category.model';
import {AlertMessageService} from '../shared/alerts/alert-message.service';
import * as objectToFormData from 'object-to-formdata';
import {Util} from '../util';


@Injectable()
export class CategoryService {

    categoryListObs = new Subject<any[]>();
    categoryListStatus$ = this.categoryListObs.asObservable();

    constructor(private http: HttpClient, private _alertMessageService: AlertMessageService, private _util: Util) {
    }

    updateCategoryListStatus(categories: any[]) {
        this.categoryListObs.next(categories);
    }

    getCategory(catId?: string) {
        return this.http.get(APPCONFIG.api_categories + '/' + catId).pipe(
            map((response) => {

                return response;
            }),
            catchError((error: HttpErrorResponse) => {
                return observableThrowError(error);
            }), );

    }

    getCategoryBySlug(slug: string) {
        return this.http.get(APPCONFIG.api_categories + '/by_slug/' + slug).pipe(
            map((response) => {

                return response;
            }),
            catchError((error: HttpErrorResponse) => {
                return observableThrowError(error);
            }), );

    }

    getCategories() {
        return this.http.get(APPCONFIG.api_categories).pipe(
            map((response: any) => {
                const categories = response;
                return categories;
            }),
            catchError((error: HttpErrorResponse) => {
                return observableThrowError(error);
            }), );

    }

    createCategory(category: Category, icon?): Observable<Category> {
        const formData = this._util.createFormData(category);
        if (icon && typeof icon === 'object') {
            formData.append('icon', icon, icon.name);
        }
        return this.http.post(APPCONFIG.api_categories, formData).pipe(
            map((response: any) =>  {
                return response;
            }),
            catchError((error: HttpErrorResponse) => {
                this._alertMessageService.handleMessage(error.message, 'error');
                return observableThrowError(error);
            }), );
    }

    updateCategory(category: Category, icon, iconChanged) {

        const formData = this._util.createFormData(category);
        if (icon && iconChanged) {
            formData.append('icon', icon, icon.name);
            formData.append('iconChanged', iconChanged);
        } else {
            formData.append('iconChanged', iconChanged);
        }
        return this.http.put(APPCONFIG.api_categories + '/' + category._id, formData).pipe(
            map((response: any) => {
                const result = response;

                return result;
            }),
            catchError((error: HttpErrorResponse) => {
                this._alertMessageService.handleMessage(error.message, 'error');
                return observableThrowError(error);
            }), );
    }

    deleteCategory(category: any) {
        return this.http.delete(APPCONFIG.api_categories + '/' + category._id).pipe(
            map((response: any) => {
                return response;
            }),
            catchError((error: HttpErrorResponse) => {
                this._alertMessageService.handleMessage(error.message, 'error');
                return observableThrowError(error);
            }), );
    }
}
