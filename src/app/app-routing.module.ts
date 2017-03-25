import { ModuleWithProviders }  from '@angular/core';
import { Routes, RouterModule, PreloadAllModules } from '@angular/router';

import { PatientComponent }   from './video-chat/patient/patient';
import { DoctorComponent } from './video-chat/doctor/doctor'

import { SumitComponent } from './video-chat/sumit/sumit'
import { NayyarComponent } from './video-chat/nayyar/nayyar'
import { AnmolComponent } from './video-chat/anmol/anmol'
import { PublisherComponent } from './audio-chat/publisher/publisher'
import { SenderComponent } from './text-chat/sender/sender'
import { ReceiverComponent } from './text-chat/receiver/receiver'
import { SenderDemoComponent } from './text-chat-demo/sender/sender'
import { ReceiverDemoComponent } from './text-chat-demo/receiver/receiver'
import { FileReceiverComponent } from './file-share/receiver/receiver'
import { FileReceiver2Component } from './file-share/receiver2/receiver2'
import { FileSenderComponent } from './file-share/sender/sender'

const initialRoute = () => {
  return true;
};

const appRoutes: Routes = [
  { path: '', redirectTo: '/patient', pathMatch: 'full' }, 
  { path: 'patient', component: PatientComponent },
  { path: 'doctor/:id', component: DoctorComponent },
  { path: 'sumit', component: SumitComponent },
  { path: 'nayyar', component: NayyarComponent },
  { path: 'anmol', component: AnmolComponent },
  { path: 'publisher', component: PublisherComponent },
  { path: 'sender', component: SenderComponent },
  { path: 'receiver', component: ReceiverComponent },
  { path: 'text-sender/:id', component: SenderDemoComponent },
  { path: 'text-receiver/:id', component: ReceiverDemoComponent },
  { path: 'file-receiver', component:FileReceiverComponent},
  { path: 'file-receiver2', component:FileReceiver2Component},
  { path: 'file-sender', component:FileSenderComponent}
  
];

export const routing: ModuleWithProviders = RouterModule.forRoot(appRoutes, { preloadingStrategy: PreloadAllModules });

