import {Component, OnInit} from '@angular/core';
import {CityService} from '../../../services/city.service';

declare var $: any;

@Component({
    selector: 'app-footer-frontend',
    templateUrl: 'footer-frontend.component.html'
})

export class FooterFrontendComponent implements OnInit {

    cities_left: Array<any> = [];
    cities_right: Array<any> = [];

    constructor(private _cityService: CityService) {}

    ngOnInit() {
        /*this._cityService.getCitiesCountAds()
            .subscribe(response => {
                const half_length = Math.ceil(response.length / 2);
                this.cities_left = response.splice(0, half_length);
                this.cities_right = response;
            });*/
    }
}
