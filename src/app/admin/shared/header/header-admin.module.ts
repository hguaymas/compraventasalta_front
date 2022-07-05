import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HeaderAdminComponent } from './header-admin.component';

@NgModule({
    imports: [ RouterModule, CommonModule ],
    declarations: [ HeaderAdminComponent ],
    exports: [ HeaderAdminComponent ]
})

export class HeaderAdminModule {}
