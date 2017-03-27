import { ModuleWithProviders }  from '@angular/core';
import { Routes, RouterModule, PreloadAllModules } from '@angular/router';

// import { PatientComponent }   from './video-chat/patient/patient';
// import { DoctorComponent } from './video-chat/doctor/doctor'

// import { PublisherComponent } from './audio-chat/publisher/publisher'
// import { SenderComponent } from './text-chat/sender/sender'
// import { ReceiverComponent } from './text-chat/receiver/receiver'
// import { SenderDemoComponent } from './text-chat-demo/sender/sender'
// import { ReceiverDemoComponent } from './text-chat-demo/receiver/receiver'
// import { FileReceiverComponent } from './file-share/receiver/receiver'
// import { FileSenderComponent } from './file-share/sender/sender'

import { FinalPatientComponent } from './final-chat/patient/patient'
import { FinalDoctorComponent } from './final-chat/doctor/doctor'

const initialRoute = () => {
  return true;
};

const appRoutes: Routes = [
  { path: '', redirectTo: '/patient/1', pathMatch: 'full' }, 
  { path: 'patient/:id', component:FinalPatientComponent},
  { path: 'doctor/:id', component:FinalDoctorComponent}
  // { path: 'patient', component: PatientComponent },
  // { path: 'doctor/:id', component: DoctorComponent },  
  // { path: 'publisher', component: PublisherComponent },
  // { path: 'sender', component: SenderComponent },
  // { path: 'receiver', component: ReceiverComponent },
  // { path: 'text-sender/:id', component: SenderDemoComponent },
  // { path: 'text-receiver/:id', component: ReceiverDemoComponent },
  // { path: 'file-receiver/:id', component:FileReceiverComponent},  
  // { path: 'file-sender', component:FileSenderComponent},
  
];

export const routing: ModuleWithProviders = RouterModule.forRoot(appRoutes, { preloadingStrategy: PreloadAllModules });

