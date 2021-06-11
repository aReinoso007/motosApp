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
  

}
