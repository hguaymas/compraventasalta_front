export class Ad {
    _id?: string;
    title: string;
    content: string;
    images?: any;
    mainImage?: any;
    city?: string;
    category: string;
    subcategory: string;
    user?: string;
    enabled?: boolean;
    status?: string;
    republishedDate?: string;
    reminderDate: string;
    price?: number;
    currency?: string;
    priceType?: string;
    ipFrom?: string;
    extraFields?: any;

    constructor() {}

}
