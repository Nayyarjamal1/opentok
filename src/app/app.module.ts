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

import { PatientComponent }   from './video-chat/patient/patient';
import { DoctorComponent } from './video-chat/doctor/doctor'

import { PublisherComponent } from './audio-chat/publisher/publisher'
import { SenderComponent } from './text-chat/sender/sender'
import { ReceiverComponent } from './text-chat/receiver/receiver'

import { SenderDemoComponent } from './text-chat-demo/sender/sender'
import { ReceiverDemoComponent } from './text-chat-demo/receiver/receiver'

import { FileReceiverComponent } from './file-share/receiver/receiver'
import { FileSenderComponent } from './file-share/sender/sender'

import { FinalPatientComponent } from './final-chat/patient/patient'
import { FinalDoctorComponent } from './final-chat/doctor/doctor'

import { DialogModule, ButtonModule, InputTextModule} from 'primeng/primeng'

@NgModule({
  declarations: [
    AppComponent,
    
    PatientComponent,
    DoctorComponent,
    
    PublisherComponent,
    SenderComponent,
    ReceiverComponent,
    
    SenderDemoComponent,
    ReceiverDemoComponent,
    
    FileReceiverComponent,
    FileSenderComponent,
    
    FinalPatientComponent,
    FinalDoctorComponent
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
