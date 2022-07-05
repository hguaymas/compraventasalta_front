import {AfterViewInit, Component, OnInit} from '@angular/core';
import {APPCONFIG} from '../../config';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {Ad} from '../../models/ad.model';
import {AlertMessageService} from '../../shared/alerts/alert-message.service';
import {MessageService} from '../../services/message.service';
declare var $: any;

@Component({
    selector: 'app-contact-form',
    templateUrl: './contact-form.component.html'
})
export class ContactFormComponent implements OnInit, AfterViewInit {
    test: Date = new Date();
    randomY = Math.random() * 100;
    brand = APPCONFIG.brand;
    contactForm: FormGroup;
    sendingMessage = false;
    constructor(private _alertMessageService: AlertMessageService, public _messageService: MessageService) {}

    ngOnInit() {
        this.contactForm = new FormGroup({
            recaptcha: new FormControl(null, Validators.required),
            firstname: new FormControl(null, Validators.required),
            lastname: new FormControl(null, Validators.required),
            email: new FormControl(null, [
                Validators.required,
                Validators.pattern('^[a-z0-9!#$%&\'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&\'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$')
            ]),
            subject: new FormControl(null, Validators.required),
            comments: new FormControl(null, Validators.required)
        });
    }

    onSubmit() {
        this.sendingMessage = true;
        const message = {
            firstname: this.contactForm.value.firstname,
            lastname: this.contactForm.value.lastname,
            email: this.contactForm.value.email,
            subject: this.contactForm.value.subject,
            comments: this.contactForm.value.comments
        };
        this._messageService.sendContactMessage(message)
            .subscribe(response => {
                    this.sendingMessage = false;
                    this._alertMessageService.handleMessage('Excelente!, tu mensaje ha sido enviado y pronto nos pondremos en contacto!', 'success');
                    this.contactForm.reset();
                },
                error => {
                    this.sendingMessage = false;
                });
    }

    ngAfterViewInit() {
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
}
