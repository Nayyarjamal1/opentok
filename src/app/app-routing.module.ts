import { ModuleWithProviders }  from '@angular/core';
import { Routes, RouterModule, PreloadAllModules } from '@angular/router';

import { CallComponent }   from './call/call';
import { DemoComponent }   from './demo/demo';
import { AnswerComponent } from './answer/answer'
import { SumitComponent } from './sumit/sumit'
import { NayyarComponent } from './nayyar/nayyar'
import { AnmolComponent } from './anmol/anmol'

const initialRoute = () => {
  return true;
};

const appRoutes: Routes = [
  { path: '', redirectTo: '/demo', pathMatch: 'full' },  
  { path: 'call', component: CallComponent },
  { path: 'answer', component: AnswerComponent },
  { path: 'demo', component: DemoComponent },
  { path: 'sumit', component: SumitComponent },
  { path: 'nayyar', component: NayyarComponent },
  { path: 'anmol', component: AnmolComponent },
];

export const routing: ModuleWithProviders = RouterModule.forRoot(appRoutes, { preloadingStrategy: PreloadAllModules });

