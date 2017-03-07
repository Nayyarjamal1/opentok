import { BrowserModule } from '@angular/platform-browser';
import { NgModule, enableProdMode } from '@angular/core';
import { NgForm, ReactiveFormsModule, FormControlDirective, FormGroupDirective} from '@angular/forms'
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { routing } from './app-routing.module';
import { RouterModule, Routes } from '@angular/router';
import { HashLocationStrategy, LocationStrategy } from '@angular/common';

import { AppComponent } from './app.component';

import { DemoComponent }   from './demo/demo';
import { CallComponent }   from './call/call';
import { AnswerComponent } from './answer/answer'
import { SumitComponent } from './sumit/sumit'
import { NayyarComponent } from './nayyar/nayyar';
import { DialogModule, ButtonModule } from 'primeng/primeng'

@NgModule({
  declarations: [
    AppComponent,
    CallComponent,
    AnswerComponent,
    SumitComponent,
    NayyarComponent,
    DemoComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    routing,    
    ReactiveFormsModule,
    
    DialogModule,
    ButtonModule
  ],
  providers: [{provide: LocationStrategy, useClass: HashLocationStrategy}],
  bootstrap: [AppComponent]
})
export class AppModule { }
