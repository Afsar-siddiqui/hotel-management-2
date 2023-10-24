import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MainComponent } from './layout/main/main.component';

const routes: Routes = [
  {path: '', component: MainComponent, loadChildren:()=> import('./component/frontend/frontend.module').then(m=>m.FrontendModule)},
  {path:'admin', loadChildren:()=> import('./component/admin/admin.module').then(m=>m.AdminModule)},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
