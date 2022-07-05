import { environment } from '../environments/environment';

function makeAppConfig() {
    const date = new Date();
    const year = date.getFullYear();

    const api_server = environment.API_SERVER || 'http://localhost:3000';
    const socket_server = environment.SOCKET_SERVER || 'http://localhost:3000';
    const host = environment.HOST || 'http://localhost:4200';
    const AppConfig = {
        brand: 'Compra Venta Salta',
        user: 'Hernan',
        city: 'Salta',
        citySlug: 'salta',
        year: year,
        file_types: ['image/jpeg', 'image/gif', 'image/bmp', 'image/png'],
        path_icons: 'static/images/icons',
        path_images: 'static/images/ads/:id',
        path_profiles: 'static/images/profiles/:id',
        api_server: api_server,
        socket_server: socket_server,
        host: host,
        api_notifications: api_server + '/notifications',
        api_messages: api_server + '/messages',
        api_categories: api_server + '/categories',
        api_cities: api_server + '/cities',
        api_users: api_server + '/users',
        api_ads: api_server + '/ads',
        api_login: api_server + '/login',
        api_forgot_password: api_server + '/forgot_password',
        api_account_activation: api_server + '/account_activation',
        api_user_token: api_server + '/check_user_token',
        api_update_requested_password: api_server + '/update_requested_password',
        api_login_facebook: api_server + '/login_facebook',
        currencies: ['$', 'USD'],
        sortByList: [
            {value: 'recientes', text: 'Más recientes'},
            {value: 'menorPrecio', text: 'Menor Precio'},
            {value: 'mayorPrecio', text: 'Mayor Precio'}
        ],
        priceTypes: [
            {value: 'NEGOTIABLE', text: 'Negociable'},
            {value: 'FIXED', text: 'Precio Fijo'},
            {value: 'FREE', text: 'Gratis'}
        ],
        priceTypeTexts: {
            'NEGOTIABLE': 'Negociable',
            'FIXED': 'Precio Fijo',
            'FREE': 'Gratis'
        },
        roles: {
            ADMINISTRATOR: 'ADMINISTRATOR',
            USER: 'USER'
        },
        facebook: {
            appId: environment.FACEBOOK_APP_ID || '648565348905581',
            appSecret: environment.FACEBOOK_APP_SECRET,
            scope: 'email,groups_show_list,publish_to_groups',
            // scope: 'email',
            pageId: '286754618016560',
            accessToken: environment.FACEBOOK_ACCESS_TOKEN
        },
        cloudfront_server: environment.CLOUDFRONT_SERVER || 'https://d24ybofanksy1z.cloudfront.net',
        imagesSizes: {
            'big': 'resized/600x450',
            'medium': 'resized/600x450',
            'small': 'resized/240x200',
            'thumb': 'resized/200x150'
        },
        pageSize: environment.PAGE_SIZE || 4
    };

    return AppConfig;
}

export const APPCONFIG = makeAppConfig();
