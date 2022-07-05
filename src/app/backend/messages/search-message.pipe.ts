import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'SearchMessagePipe' })
export class SearchMessagePipe implements PipeTransform {
    transform(value, args?): Array<any> {
        const searchText = new RegExp(args, 'ig');
        if (value) {
            return value.filter(message => {
                if (message.ad.title) {
                    return message.ad.title.search(searchText) !== -1;
                }
            });
        }
    }
}
