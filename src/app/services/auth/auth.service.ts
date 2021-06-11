import { Injectable, NgZone } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { User } from 'src/app/shared/services/user';
import {  switchMap, first, take, map } from "rxjs/operators";
import { AngularFireStorage } from '@angular/fire/storage';

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

  login(email: string, password: string){
    return this.afAuth.signInWithEmailAndPassword(email, password)
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

  async updateUserData(usertemp: any, provider: any){
    console.log("update" + JSON.stringify(usertemp));
    const doc: any = await this.userExists(usertemp.email);
    console.log("doc" + JSON.stringify(doc));
    let data: any;
    let user: any = JSON.parse(JSON.stringify(usertemp));

    console.log("doc" + JSON.stringify(doc));
    if (doc == null || doc == "") {
      //Crear cuenta
      data = {
        uid: user.uid,
        email: user.email || null,
        displayName: user.displayName || '',
        photoURL: user.photoURL || "https://goo.gl/7kz9qG",
        provider: provider,
        lastLogin: new Date(Number(user.lastLoginAt)) || new Date(),
        createdAt: new Date(Number(user.createdAt)) || new Date()
      };
    } else if (doc.active == false) {
      throw { error_code: 999, error_message: "Acceso denegado, servicio deshabilitado, consulte con el administrador." };
    } else {
      //Actualizar cuenta
      data = {
        uid: user.uid,
        email: user.email || null,
        displayName: user.displayName || '',
        photoURL: user.photoURL || "https://goo.gl/7kz9qG",
        provider: provider,
        lastLogin: new Date(Number(user.lastLoginAt)) || new Date()
      };
    }
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
