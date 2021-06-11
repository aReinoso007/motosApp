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
      confirmPassword: ['', Validators.required]
    })
   }

  ngOnInit(): void {
  }

  /*checkPassword(form: FormGroup){
    const password = form.get('password').value;
    const confirmedPassword = form.get('confirmPassword').value;
    return password === confirmedPassword ? null : { notSame: true}
  }*/

  togglePassword() {
    this.showPassword = !this.showPassword;
    if(this.passwordToggleIcon == 'eye'){
      this.passwordToggleIcon = 'eye-off'
    }else{
      this.passwordToggleIcon = 'eye';
    }
  }

  async register(){
    console.log(
      'Valores del formulario: ', this.form.get('email').value, ', ', this.form.get('nombre').value, ', ', this.form.get('confirmPassword').value
    )
    let err = await this.authService.signUp(
      this.form.get('nombre').value, 
      this.form.get('email').value, 
      this.form.get('confirmPassword').value);
    if(err === undefined){
      this.authService.emailPasswordLogin(this.form.get('email').value, this.form.get('confirmPassword').value);
      this.router.navigate(['dashboard']);
      alert('Registro exitoso');
    }else{
      let e = JSON.stringify(err)
        if (e.includes('The email address is badly formatted'))
          alert("Debe ingresar un correo válido")
        if (e.includes('Password should be at least 6 characters'))
          alert("La contraseña debe tener por lo menos 6 caracteres")
    }

  }


}
