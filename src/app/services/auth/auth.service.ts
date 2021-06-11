import { Injectable, NgZone } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { User } from 'src/app/shared/services/user';
import {  switchMap, first, take, map } from "rxjs/operators";
import { AngularFireStorage } from '@angular/fire/storage';
import * as firebase from 'firebase/app';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  userData: any;

  constructor(
    public afs: AngularFirestore,
    public afAuth: AngularFireAuth,
    public afStorage: AngularFireStorage,
    public router: Router,
    public ngZone: NgZone
  ) { 
    this.afAuth.authState.subscribe(user => {
      if(user){
        this.userData = user;
        localStorage.setItem('user', JSON.stringify(this.userData));
      }else{
        localStorage.setItem('user', '');
        
      }
    })
  }

  async login(email: string, password: string){
    return await this.afAuth.signInWithEmailAndPassword(email, password)
    .then((r)=>{
      this.ngZone.run(()=>{
        this.router.navigate(['dashboard']);
      });
      this.setUserData(r.user);
    }).catch((error)=>{
      window.alert(error.message)
    })
    
  }

  async emailPasswordLogin(email: string, password: string){
    try{
      const credentials = firebase.default.auth.EmailAuthProvider.credential(email, password);
      const firebaseUser = await firebase.default.auth().signInWithCredential(credentials);
      return await this.saveUserData(firebaseUser.user, "email");
    }catch(err){
      return err;
    }
  }

  logOut(){
    return this.afAuth.signOut();
  }

  async signUp(name: string, email: string, password: string): Promise<any>{
    try{
      await this.afAuth.createUserWithEmailAndPassword(email, password);
      const user = await this.afAuth.currentUser;
      return await user?.updateProfile({
        displayName: name,
        photoURL: "https://goo.gl/7kz9qG"
      });
    }catch(err){
      console.error("Error" +  JSON.stringify(err));
      return err;
    }
  }

  registerEmailAndPassword(email: string, password: string){
    try{
      return this.afAuth.createUserWithEmailAndPassword(email, password);
    }catch(err){
      return console.error('error registrando usuario, error: ', err);
    }
  }

  async sendVerificationEmail(){
    return await firebase.default.auth().currentUser.sendEmailVerification()
                .then(()=>{
                  this.router.navigate(['verify-email']);
                })
  }

  userExists(email: string){
    console.log("userExists" + email);
    return this.afs
      .collection("users", ref => ref.where("email", "==", email))
      .valueChanges()
      .pipe(first())
      .toPromise();
  }

  setUserData(user: any){
    const userRef: AngularFirestoreDocument<any> = this.afs.doc(`users/${user.uid}`);
    
    const userData: User = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      emailVerified: user.emailVerified
    }
    return userRef.set(userData, {
      merge: true
    })
  }

  async uploadFile(id: string, file: string): Promise<any>{
    if(file && file.length){
      try{
        const task = await this.afStorage.ref('profiles').child(id).put(file[0]);
        return this.afStorage.ref(`profiles/${id}`).getDownloadURL().toPromise();
      }catch(err){
        console.error(err);
      }
    }
  }
  

async saveUserData(userTemp: any, provider: any){
  const doc: any = await this.userExists(userTemp.email);
  let data: any;
  let user: any = JSON.parse(JSON.stringify(userTemp));

  if(doc == null || doc ==""){
      //se registra la cuenta del usuario
      /*usuario: normal sin organizacion
      administrador: es presidente de un grupo,
      participante: pertenece a una organizacion
      */
      data = {
        uid: user.uid,
        email: user.email,
        rol: 'user',
        organizacion: '',
        displayName: user.displayName,
        photoURL: user.photoURL,
        prvider: provider,
        lastLogin: new Date(Number(user.lastLoginAt)) || new Date(),
        createdAt: new Date(Number(user.createdAt)) || new Date()
      };
    }else if(doc.active == false ){
      throw {error_code: 999, error_message: "Acesso denegado"};
    }else{
      data = {
        uid: user.uid,
        email: user.email || null,
        provider: provider,
        lastLogin: new Date(Number(user.lastLoginAt)) || new Date()
      };
    }
    console.log("Data: ", JSON.stringify(data))
    const userRef = this.afs.collection<any>('users');
    return userRef.doc(`${user.uid}`).set(data, {merge: true});
  }

}
