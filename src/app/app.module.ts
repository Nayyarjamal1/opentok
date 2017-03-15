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

import { DemoComponent }   from './demo/demo';
import { CallComponent }   from './call/call';
import { AnswerComponent } from './answer/answer'
import { PublisherComponent } from './publisher/publisher'
import { SumitComponent } from './sumit/sumit'
import { NayyarComponent } from './nayyar/nayyar';
import { AnmolComponent } from './anmol/anmol';
import { SubscriberDemoComponent } from './subscriber-demo/subscriber-demo'
import { PublisherDemoComponent } from './publisher-demo/publisher-demo'
import { SenderComponent } from './text-chat-sender/text-chat-sender'
import { ReceiverComponent } from './text-chat-reciever/text-chat-reciever'

import { DialogModule, ButtonModule, InputTextModule} from 'primeng/primeng'

@NgModule({
  declarations: [
    AppComponent,
    CallComponent,
    AnswerComponent,
    SumitComponent,
    NayyarComponent,
    DemoComponent,
    AnmolComponent,
    PublisherComponent,
    SubscriberDemoComponent,
    PublisherDemoComponent,
    SenderComponent,
    ReceiverComponent
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
  providers: [GlobalService, {provide: LocationStrategy, useClass: HashLocationStrategy}],
  bootstrap: [AppComponent]
})
export class AppModule { }
