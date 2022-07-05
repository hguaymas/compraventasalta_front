import {Injectable} from '@angular/core';



import {Observable} from 'rxjs';
import {Category} from '../../models/category.model';
import {APPCONFIG} from '../../config';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';


@Injectable()
export class HomepageService {
    private categories: Category[] = [];

    constructor(private http: HttpClient) {
    }

}
