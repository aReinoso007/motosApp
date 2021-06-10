import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  form: FormGroup;
  loading = false;
  constructor(
    private fb: FormBuilder,
    private _snackBar: MatSnackBar
  ) { 
    this.form = this.fb.group({
      usuario: ['', Validators.required],
      password: ['', Validators.required]
    })
  }

  ngOnInit(): void {
  }

  ingresar(){
    const usuario = this.form.value.usuario;
    const password = this.form.value.password;
    console.log('data atrapada: ', usuario, ', ',password)
    if(usuario == 'alex' && password == 'alex123'){
      this.fakeLoading();
    }else{
      this.error();
      this.form.reset();
    }
  }

  error(){
    this._snackBar.open('Usuario o contransena son inválidos', '', {
      duration: 5000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom'
    })
  }

  fakeLoading(){
    this.loading = true;
    setTimeout(()=>{
      //redireccion a dashboard
      this.loading = false;
    }, 1500);
  }

}
