import { BrowserModule } from '@angular/platform-browser';
import { NgModule, enableProdMode } from '@angular/core';
import { NgForm, ReactiveFormsModule, FormControlDirective, FormGroupDirective} from '@angular/forms'
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { routing } from './app-routing.module';
import { RouterModule, Routes } from '@angular/router';
import { HashLocationStrategy, LocationStrategy } from '@angular/common';

import { AppComponent } from './app.component';
import { GlobalService } from './GlobalService';

import { DemoComponent }   from './video-chat/demo/demo';
import { PublisherComponent } from './audio-chat/publisher/publisher'
import { SumitComponent } from './video-chat/sumit/sumit'
import { NayyarComponent } from './video-chat/nayyar/nayyar'
import { AnmolComponent } from './video-chat/anmol/anmol'
import { SenderComponent } from './text-chat/sender/sender'
import { ReceiverComponent } from './text-chat/receiver/receiver'

import { FileReceiverComponent } from './file-share/receiver/receiver'
import { FileSenderComponent } from './file-share/sender/sender'
import { FileReceiver2Component } from './file-share/receiver2/receiver2'

import { DialogModule, ButtonModule, InputTextModule} from 'primeng/primeng'

@NgModule({
  declarations: [
    AppComponent,
    SumitComponent,
    NayyarComponent,
    DemoComponent,
    AnmolComponent,
    PublisherComponent,
    SenderComponent,
    ReceiverComponent,
    
    FileReceiverComponent,
    FileSenderComponent,
    FileReceiver2Component
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    routing,
    ReactiveFormsModule,

    DialogModule,
    ButtonModule,
    InputTextModule
  ],
  providers: [GlobalService, { provide: LocationStrategy, useClass: HashLocationStrategy }],
  bootstrap: [AppComponent]
})
export class AppModule { }
