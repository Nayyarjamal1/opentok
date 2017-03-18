import { ModuleWithProviders }  from '@angular/core';
import { Routes, RouterModule, PreloadAllModules } from '@angular/router';

import { DemoComponent }   from './video-chat/demo/demo';
import { SumitComponent } from './video-chat/sumit/sumit'
import { NayyarComponent } from './video-chat/nayyar/nayyar'
import { AnmolComponent } from './video-chat/anmol/anmol'
import { PublisherComponent } from './audio-chat/publisher/publisher'
import { SenderComponent } from './text-chat/sender/sender'
import { ReceiverComponent } from './text-chat/receiver/receiver'
import { FileReceiverComponent } from './file-share/receiver/receiver'
import { FileReceiver2Component } from './file-share/receiver2/receiver2'
import { FileSenderComponent } from './file-share/sender/sender'

const initialRoute = () => {
  return true;
};

const appRoutes: Routes = [
  { path: '', redirectTo: '/file-sender', pathMatch: 'full' }, 
  { path: 'demo', component: DemoComponent },
  { path: 'sumit', component: SumitComponent },
  { path: 'nayyar', component: NayyarComponent },
  { path: 'anmol', component: AnmolComponent },
  { path: 'publisher', component: PublisherComponent },
  { path: 'sender', component: SenderComponent },
  { path: 'receiver', component: ReceiverComponent },
  { path: 'file-receiver', component:FileReceiverComponent},
  { path: 'file-receiver2', component:FileReceiver2Component},
  { path: 'file-sender', component:FileSenderComponent}
  
];

export const routing: ModuleWithProviders = RouterModule.forRoot(appRoutes, { preloadingStrategy: PreloadAllModules });

