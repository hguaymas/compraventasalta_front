import {AfterViewInit, Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {AbstractControl, FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {FacebookService, InitParams, LoginResponse} from 'ngx-facebook';
import {APPCONFIG} from '../../config';
import {AdService} from '../../services/ad.service';
import {UserService} from '../../services/user.service';
import {CityService} from '../../services/city.service';
import {AlertMessageService} from '../../shared/alerts/alert-message.service';
import {AuthService} from '../../auth/auth.service';
import {User} from '../../models/user.model';
import {MessageService} from '../../services/message.service';
import {BlockUI, NgBlockUI} from 'ng-block-ui';
import * as io from 'socket.io-client';

declare var $: any;

@Component({
    selector: 'app-my-messages',
    templateUrl: './my-messages.component.html',
    styles: [`
        div.tg-btn {
            color: #fff;
            padding: 0 50px;
            position: relative;
            text-align: center;
            overflow: hidden;
            border-radius: 3px;
            display: inline-block;
            vertical-align: middle;
            text-transform: capitalize;
            background: rgba(0,0,0,0.00);
            font: 500 16px/25px 'Quicksand', Arial, Helvetica, sans-serif;
        }
    `]

})
export class MyMessagesComponent implements OnInit, AfterViewInit {
    user: User;
    users: Array<any> = [];
    messages: Array<any> = [];
    chat: Array<any> = [];
    config;
    loggedInUser: any;
    currentAd;
    currentUser;
    currentMessage;
    filtered = [];
    searchMessage: string;
    replayBoxCtrl: FormControl;
    @BlockUI('reply-box') blockUIBox: NgBlockUI;
    socket: any;

    constructor(
        private _authService: AuthService,
        private _userService: UserService,
        private _messageService: MessageService,
        public router: Router
    ) {
        this.config = APPCONFIG;
        this.replayBoxCtrl = new FormControl(null, Validators.required);
        this.socket =  io.connect(APPCONFIG.socket_server);
    }

    ngOnInit() {
        this.loggedInUser = this._authService.getSessionUser();
        const userId = this._authService.getSessionUserId();
        const that = this;
        let adExists = false;
        let userExists = false;
        this.socket.on('new-message', function (data) {
            if (userId == data.userTo._id && that.messages) {
                for (const message of that.messages) {
                    if (data.ad._id == message.ad._id) {
                        adExists = true;
                        for (const user of message.users) {
                            if (String(data.userFrom._id) == String(user._id)) {
                                userExists = true;
                                user.messages = data.chat;
                                user.readedTo = false;
                                message.readed = false;
                                if (that.currentAd._id == data.ad._id && that.currentUser._id == data.userFrom._id) {
                                    that.chat = data.chat;
                                    that.markAsReaded();
                                    that.scrollChat();
                                }
                            }
                        }
                        if (!userExists) { // Si no hay mensajes de ese usuario para el anuncio, lo agrego
                            const usr = data.userFrom;
                            usr.messages = data.chat;
                            usr.readedTo = false;
                            message.readed = false;
                            message.users.unshift(usr);
                        }
                    }
                }
                if (!adExists) {
                    const ad = data.ad;
                    const usr = data.userFrom;
                    const users = [];
                    usr.messages = data.chat;
                    usr.readedTo = false;
                    users.push(usr);
                    that.messages.unshift({
                        ad: ad,
                        readed: false,
                        users: users
                    });
                    if (that.messages.length == 1) {
                       that.currentMessage = that.messages[0];
                       that.currentAd = ad;
                       that.users = that.currentMessage.users;
                       that.currentUser = that.currentMessage.users[0];
                       that.chat = that.currentUser.messages;
                       that.scrollChat();
                       that.markAsReaded();
                    }
                }
            }
        });
        this._messageService.getMessages()
            .subscribe(messages => {
                this.messages = messages;
                if (messages.length > 0) {
                   this.currentMessage = messages[0];
                   this.currentAd = messages[0].ad;
                   this.users = messages[0].users;
                   if (this.users.length > 0) {
                       this.currentUser = this.users[0];
                       this.chat = this.users[0].messages;
                       this.markAsReaded();
                   }
                    let readed = true;
                    for (const user of this.currentMessage.users) {
                        if (user.readedTo == false) {
                            readed = false;
                            break;
                        }
                    }
                    this.currentMessage.readed = readed;
                   // this.scrollChat(30);
                    this.scrollElements();

                }
            });
    }

    sendMessage() {
        this.blockUIBox.start('Enviando...');
        const messageText = this.replayBoxCtrl.value;
        const adId = this.currentAd._id;
        const userTo = this.currentUser._id;
        this._messageService.replyMessage(adId, userTo, messageText)
            .subscribe(message => {
                (message);
                const lastMessage = message.chat.slice(-1);
                if (lastMessage) {
                    // this.chat.push(lastMessage[0]);
                    this.currentUser.messages.push(lastMessage[0])
                }
                this.replayBoxCtrl.reset();
                this.blockUIBox.stop();
                this.scrollChat();
            });
    }

    onChangeSearch(messages) {
        (messages);
    }

    scrollChat(time?) {
        if (!time) {
            time = 10;
        }
        setTimeout(() => {
            const jqReplybox = $('.chatscroll');
            jqReplybox.mCustomScrollbar('scrollTo', 'bottom', {
                axis: 'y'
            });
        }, time);
    }

    showUsers(idx) {
        this.currentMessage = this.messages[idx];
        this.currentAd = this.messages[idx].ad;
        this.users = this.messages[idx].users;
        this.currentUser = this.users[0];
        this.chat = this.currentUser.messages;
        this.scrollChat();
        this.markAsReaded();
    }
    showMessages(idx) {
        this.currentUser = this.users[idx];
        this.chat = this.users[idx].messages;
        this.scrollChat();
        this.markAsReaded();
    }

    markAsReaded() {
        if (!this.currentUser.readedTo) {
            return this._messageService.markAsReaded(this.currentUser._id, this.currentAd._id)
                .subscribe(message => {
                    this.currentUser.readedTo = true;
                    let readed = true;
                    for (const user of this.currentMessage.users) {
                        if (!user.readedTo) {
                            readed = false;
                            break;
                        }
                    }
                    this.currentMessage.readed = readed;
                });
        }
    }

    scrollElements() {
        // SCROLLBARS
        setTimeout(() => {
            if ($('.tg-verticalscrollbar').length > 0) {
                const _tg_verticalscrollbar = $('.tg-verticalscrollbar');
                _tg_verticalscrollbar.mCustomScrollbar({
                    axis: 'y',
                    // scrollInertia: 250
                });
            }
            if ($('.tg-horizontalthemescrollbar').length > 0) {
                const _tg_horizontalthemescrollbar = $('.tg-horizontalthemescrollbar');
                _tg_horizontalthemescrollbar.mCustomScrollbar({
                    axis: 'x',
                    advanced: {autoExpandHorizontalScroll: true},
                });
            }
            this.scrollChat();
        }, 1500);
    }

    ngAfterViewInit() {

    }
}
