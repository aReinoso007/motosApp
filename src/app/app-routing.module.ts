import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { LandingComponent } from './components/landing/landing.component';
import { LoginComponent } from './components/login/login.component';
import { SignUpComponent } from './components/sign-up/sign-up.component';

const routes: Routes = [
  {path:'', redirectTo:'landing', pathMatch:'full'},
  { path: 'login', component: LoginComponent},
  /*Esto es lazy loading, cuando el usuario entra a esa ruta se carga el modulo*/
  { path: 'dashboard', component: DashboardComponent},
  /*Aqui mas luego toca crear pageNotFound */
  { path:'sign-up', component: SignUpComponent},
  { path:'landing', component: LandingComponent},
  { path:'**', redirectTo:'login', pathMatch:'full'}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
