import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth/auth.service';
import { Usuario } from 'src/app/shared/model/usuario.model';


@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.css']
})
export class SignUpComponent implements OnInit {

  form: FormGroup;
  showPassword = false;
  passwordToggleIcon = 'eye';
  usuario: Usuario  = new Usuario();

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {
    this.form = this.fb.group({
      nombre: ['', Validators.required],
      email: ['', Validators.email],
      password: ['', Validators.required],
      password2: ['', Validators.required]
    })
   }

  ngOnInit(): void {
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
    if(this.passwordToggleIcon == 'eye'){
      this.passwordToggleIcon = 'eye-off'
    }else{
      this.passwordToggleIcon = 'eye';
    }
  }

  async register(){
    let err = await this.authService.signUp(
      this.form.value.nombre, 
      this.form.value.email, 
      this.form.value.password);
    let navigationExtras: NavigationExtras ={
      queryParams: {
        usuario: this.usuario
      }
    }
      this.router.navigate(['/datosAdicionales'], navigationExtras);
  }

}
