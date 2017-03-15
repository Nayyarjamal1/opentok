import { ModuleWithProviders }  from '@angular/core';
import { Routes, RouterModule, PreloadAllModules } from '@angular/router';

import { CallComponent }   from './call/call';
import { DemoComponent }   from './demo/demo';
import { AnswerComponent } from './answer/answer'
import { PublisherComponent } from './publisher/publisher'
import { SumitComponent } from './sumit/sumit'
import { NayyarComponent } from './nayyar/nayyar'
import { AnmolComponent } from './anmol/anmol'
import { SubscriberDemoComponent } from './subscriber-demo/subscriber-demo'
import { PublisherDemoComponent } from './publisher-demo/publisher-demo'
import { SenderComponent } from './text-chat-sender/text-chat-sender'
import { ReceiverComponent } from './text-chat-reciever/text-chat-reciever'

const initialRoute = () => {
  return true;
};

const appRoutes: Routes = [
  { path: '', redirectTo: '/sender', pathMatch: 'full' },  
  { path: 'call', component: CallComponent },
  { path: 'answer', component: AnswerComponent },
  { path: 'demo', component: DemoComponent },
  { path: 'sumit', component: SumitComponent },
  { path: 'nayyar', component: NayyarComponent },
  { path: 'anmol', component: AnmolComponent },
  { path: 'publisher', component: PublisherComponent },
  { path: 'subscriber-demo', component: SubscriberDemoComponent },
  { path: 'publisher-demo', component: PublisherDemoComponent },
  { path: 'sender', component: SenderComponent },
  { path: 'receiver', component: ReceiverComponent },
  
];

export const routing: ModuleWithProviders = RouterModule.forRoot(appRoutes, { preloadingStrategy: PreloadAllModules });

