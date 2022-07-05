import { Component, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';

@Component({
    selector: 'app-error403',
    encapsulation: ViewEncapsulation.None,
    templateUrl: './error403.component.html'
})
export class Error403Component {
    router: Router;
    randomY = Math.random() * 100;

    constructor(router: Router) {
        this.router = router;
    }
}
