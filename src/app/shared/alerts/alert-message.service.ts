import {Injectable} from '@angular/core';
import swal from 'sweetalert2'


@Injectable()
export class AlertMessageService {
    options: any = {
        cancelButtonClass: 'btn btn-outline-danger',
        buttonsStyling: false,
        focusConfirm: false,
        allowEnterKey: false
    }

    constructor() {

    }

    handleMessage(message: any, type: string, html?: boolean) {
        this.options.type = type;
        this.options.confirmButtonClass = 'btn btn-' + (type === 'error' ? 'danger' : type);
        if (html) {
            this.options.html = message;
        } else {
            this.options.text = message;
        }
        swal.fire(this.options);
    }

    close() {
        swal.close();
    }
}
