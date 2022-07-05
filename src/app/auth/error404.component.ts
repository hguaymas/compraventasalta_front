import {Component, ViewEncapsulation} from '@angular/core';
import {Router} from '@angular/router';

@Component({
    selector: 'app-error404',
    encapsulation: ViewEncapsulation.None,
    templateUrl: './error404.component.html'
})
export class Error404Component {
    router: Router;
    randomY = Math.random() * 100;

    constructor(router: Router) {
        this.router = router;
    }
}
