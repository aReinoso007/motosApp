import { Injectable, NgZone } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { User } from 'src/app/shared/services/user';
import {  switchMap, first, take, map } from "rxjs/operators";

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  userData: any;

  constructor(
    public afs: AngularFirestore,
    public afAuth: AngularFireAuth,
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

  

}
