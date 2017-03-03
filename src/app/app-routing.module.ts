import { ModuleWithProviders }  from '@angular/core';
import { Routes, RouterModule, PreloadAllModules } from '@angular/router';

import { CallComponent }   from './call/call';
import { AnswerComponent } from './answer/answer'

const initialRoute = () => {
  return true;
};

const appRoutes: Routes = [
  { path: '', redirectTo: '/call', pathMatch: 'full' },  
  { path: 'call', component: CallComponent },
  { path: 'answer', component: AnswerComponent },
];

export const routing: ModuleWithProviders = RouterModule.forRoot(appRoutes, { preloadingStrategy: PreloadAllModules });

