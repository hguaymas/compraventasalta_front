import { Router } from '@angular/router';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { APPCONFIG } from '../../config';
import { UserService } from '../../services/user.service';
import { CityService } from '../../services/city.service';
import { AlertMessageService } from '../../shared/alerts/alert-message.service';
import { AuthService } from '../../auth/auth.service';
import { User } from '../../models/user.model';
import { CropperSettings, ImageCropperComponent } from 'ngx-img-cropper';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';

declare var $: any;

@Component({
    selector: 'app-my-profile',
    templateUrl: './my-profile.component.html',
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
export class MyProfileComponent implements OnInit, AfterViewInit {
    photoForm: FormGroup;
    profileForm: FormGroup;
    passwordForm: FormGroup;
    user: User;
    users: Array<any> = [];
    photo: any;
    errorPhoto: string;
    preview: any;
    pathPhoto: string;
    photoChanged = false;
    cities: Array<any> = [];
    cropperSettings: CropperSettings;
    data: any;
    public image: any;
    city = null;
    blockedPanel = false;
    blockedPasswordPanel = false;
    blockedProfilePanel = false;
    @ViewChild('cropper', {static: true})
    cropper: ImageCropperComponent;
    @BlockUI('photo') blockUIPhoto: NgBlockUI;
    @BlockUI('profile') blockUIProfile: NgBlockUI;
    @BlockUI('password') blockUIPassword: NgBlockUI;

    constructor(
        private _authService: AuthService,
        private _userService: UserService,
        private _alertMessageService: AlertMessageService,
        private _cityService: CityService,
        public router: Router
    ) {
        this.cropperSettings = new CropperSettings();
        this.cropperSettings.noFileInput = true;
        this.cropperSettings.width = 200;
        this.cropperSettings.height = 200;
        this.cropperSettings.croppedWidth = 150;
        this.cropperSettings.croppedHeight = 150;
        this.cropperSettings.canvasWidth = 250;
        this.cropperSettings.canvasHeight = 300;
        this.cropperSettings.rounded = true;
        this.data = {};
    }

    ngOnInit() {

        this.photoForm = new FormGroup({
            photo: new FormControl(null)
        });

        this.passwordForm = new FormGroup({
            password: new FormControl('', Validators.required),
            newPassword: new FormControl('', Validators.required),
            confirmPassword: new FormControl('', [Validators.required, this.passwordMatch])
        });

        this.profileForm = new FormGroup({
            username: new FormControl(null, Validators.required),
            phone: new FormControl(null),
            city: new FormControl(null, Validators.required)
        });

        const userId = this._authService.getSessionUserId();
        this._userService.getUser(userId)
            .subscribe((user: any) => {
                this.user = user;
                if (this.user.photo) {
                    const img = new Image();
                    img.src = this.user.photo.pathCdn;
                    this.preview = img;
                }
            });

        this.getCities();

    }

    getCities() {
        this._cityService.getCities()
            .subscribe(response => {
                this.cities = response;
            });
    }

    passwordMatch(control: AbstractControl) {
        const paswd = control.root.get('newPassword');
        if (paswd && control.value != paswd.value) {
            return {
                passwordMatch: true
            };
        }
        return null;
    }

    fileChange(event) {
        const reader = new FileReader();
        this.errorPhoto = null;
        const fileList: FileList = event.target.files;
        this.image = new Image();
        const that = this;
        if (fileList.length > 0) {
            const file: File = fileList[0];
            if (this.validType(file.type)) {
                this.photo = file;
                this.photoChanged = true;
                reader.onloadend = function (loadEvent: any) {
                    that.image.src = loadEvent.target.result;
                    that.cropper.setImage(that.image);
                    // this.preview = img;
                    // that.photo = that.image;
                };
                reader.readAsDataURL(this.photo);
            } else {
                this.errorPhoto = 'El tipo archivo seleccionado no está permitido'
            }
        }
    }

    validType(fileType) {
        return APPCONFIG.file_types.indexOf(fileType) !== -1;
    }

    removePhoto() {
        this.photo = null;
        this.preview = null;
        this.data.image = null;
        this.data = {};
        this.errorPhoto = null;
        this.photoForm.reset();
        this.photoChanged = true;
    }

    dataURLtoFile(dataurl, filename) {
        let arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
            bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new File([u8arr], filename, {type: mime});
    }

    onSubmitPhoto() {
        let user;
        if (this.user) {
            user = this.user;
            // const userUpdated = this.setPhotoFormValues(user);
            let data = null;
            if (this.data.image) {
                data = this.dataURLtoFile(this.data.image, this.photo.name);
            }
            this.blockUIPhoto.start('Espere por favor...');
            this._userService.updateUserPhoto(user._id, data, this.photoChanged)
                .subscribe(
                    (result: any) => {
                        this._alertMessageService.handleMessage('Se actualizó correctamente la Foto de Perfil', 'success');
                        this._authService.updateSessionUser(result);
                        this.user = result;
                        this.removePhoto();
                        if (result.photo) {
                            const img = new Image();
                            img.src = result.photo.pathCdn;
                            this.preview = img;
                        }
                        this.blockUIPhoto.stop();
                        this.router.navigate(['backend/mi-perfil']);
                    }
                );
        }
    }

    onSubmitProfile() {
        if (this.user) {
            const user = this.user;
            user.username = this.profileForm.value.username;
            user.city = this.profileForm.value.city;
            user.phone = this.profileForm.value.phone;
            this.blockUIProfile.start('Espere por favor...');
            this._userService.updateUser(user)
                .subscribe(
                    (result: any) => {
                        this.user = result;
                        this._authService.updateSessionUser(result);
                        this.profileForm.controls['city'].setValue(user.city._id);
                        this.blockUIProfile.stop();
                        this._alertMessageService.handleMessage('Se actualizaron tus datos!', 'success');
                    }
                );
        }
    }

    public onSubmitPassword(): void {
        this.blockUIPassword.start('Espere por favor...');
        this._userService.changePassword(this._authService.getSessionUser(), this.passwordForm.value.password, this.passwordForm.value.newPassword)
            .subscribe(
                data => {
                    this.passwordForm.reset();
                    this.blockUIPassword.stop();
                    this._alertMessageService.handleMessage('Se modificó tu contraseña!', 'success');
                    // this.router.navigate(['backend/mi-perfil']);
                },
                error => {
                    console.error(error);
                }
            );
    }

    setPhotoFormValues(user: any) {
        user.photo = this.photoForm.value.photo;
        return user;
    }

    ngAfterViewInit() {
        // SCROLLBARS
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
