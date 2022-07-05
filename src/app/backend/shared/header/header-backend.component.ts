import {AfterViewInit, Component, OnInit} from '@angular/core';
import {AuthService} from '../../../auth/auth.service';
import {APPCONFIG} from '../../../config';
import {Router} from '@angular/router';
import * as io from 'socket.io-client';
import {NotificationService} from '../../../services/notification.service';
import * as moment from 'moment';
declare var $: any;

@Component({
    selector: 'app-header-backend',
    templateUrl: 'header-backend.component.html'
})

export class HeaderBackendComponent implements OnInit, AfterViewInit {

    loggedInUser;
    newMessages = 0;
    notifications: Array<any> = [];
    socket: any;

    constructor(public _authService: AuthService, private _notificationService: NotificationService, private router: Router) {
        this.socket =  io.connect(APPCONFIG.socket_server);
        moment.updateLocale('es', {});
    }

    ngOnInit() {
        this._authService.updatedUserObs
            .subscribe(
                (updatedUser) => {
                    this.loggedInUser = updatedUser;
                }
            );
        this._notificationService.getNotifications()
            .subscribe(
                (notifications: any) => {
                    this.notifications = notifications;
                    this.countNotifications();
                }
            );
        const that = this;
        this.socket.on('new-notification', function (data) {
            (data);
            if (that._authService.getSessionUserId() == data.user) {
                if (that.notifications.length >= 5) {
                    that.notifications.pop();
                }
                for (const n in that.notifications) {
                    if (that.notifications[n].code == data.code) {
                        that.notifications.splice(Number(n), 1);
                        break;
                    }
                }
                that.notifications.unshift(data);
                that.countNotifications();
            }
        });
    }

    countNotifications() {
        let count = 0;
        for (const n of this.notifications) {
            if (n.readed === false) {
                count++;
            }
        }
        this.newMessages = count;
    }

    onLogout() {
        this._authService.logout();
        this._authService.updateSessionUser(null);
        this.router.navigate(['/']);
    }

    ngAfterViewInit() {
        // SCROLLBARS
        setTimeout(() => {
            if ($('.tg-verticalscrollbar').length > 0) {
                const _tg_verticalscrollbar = $('.tg-verticalscrollbar');
                _tg_verticalscrollbar.mCustomScrollbar({
                    axis: 'y',
                });
            }
            if ($('.tg-horizontalthemescrollbar').length > 0) {
                const _tg_horizontalthemescrollbar = $('.tg-horizontalthemescrollbar');
                _tg_horizontalthemescrollbar.mCustomScrollbar({
                    axis: 'x',
                    advanced: {autoExpandHorizontalScroll: true},
                });
            }
            $('.tg-navigation ul li.menu-item-has-children, .tg-navdashboard ul li.menu-item-has-children, .tg-navigation ul li.menu-item-has-mega-menu').prepend('<span class="tg-dropdowarrow"><i class="fa fa-angle-down"></i></span>');
            $('.tg-navigation ul li.menu-item-has-children span, .tg-navdashboard ul li.menu-item-has-children span, .tg-navigation ul li.menu-item-has-mega-menu span').on('click', function() {
                $(this).parent('li').toggleClass('tg-open');
                $(this).next().next().slideToggle(300);
            });
            if ($('#tg-btnmenutoggle').length > 0) {
                $('#tg-btnmenutoggle').on('click', function(event) {
                    event.preventDefault();
                    $('#tg-wrapper').toggleClass('tg-openmenu');
                    $('body').toggleClass('tg-noscroll');
                    $('.tg-navdashboard ul.sub-menu').hide();
                });
            }
        }, 10);
    }

    markAsReaded() {
        let hasNotReaded = false;
        for (const notif of this.notifications) {
            if (notif.readed == false) {
                hasNotReaded = true;
                break;
            }
        }
        if (hasNotReaded) {
            this._notificationService.markAsReaded()
                .subscribe((response: any) => {
                    for (const notification of this.notifications) {
                        notification.readed = true;
                    }
                    this.countNotifications();
                })
        }
    }
}
