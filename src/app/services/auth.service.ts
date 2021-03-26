import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private userData: Observable<firebase.default.User>;
  private currentUser: UserData;
  private currentUser$ = new BehaviorSubject<UserData>(null);
  defaultAvatar: string = 'assets/avatar.jpg';

  constructor(
    private angularFireStore: AngularFirestore,
    private angularFireAuth: AngularFireAuth,
    private router: Router
  ) {
    this.userData = angularFireAuth.authState;

    this.userData.subscribe((user) => {
      if (user) {
        this.angularFireStore
          .collection<UserData>('users')
          .doc<UserData>(user.uid)
          .valueChanges()
          .subscribe((currentUser) => {
            if (currentUser !== undefined) {
              this.currentUser = currentUser;
            } else {
              this.currentUser = null;
            }
            this.currentUser$.next(this.currentUser);
          });
      }
    });
  }

  CurrentUser(): Observable<UserData> {
    return this.currentUser$.asObservable();
  }

  signUp(
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    avatar = 'assets/avatar.jpg'
  ) {
    this.angularFireAuth
      .createUserWithEmailAndPassword(email, password)
      .then((response) => {
        if (response) {
          if (avatar === undefined || avatar === '')
            avatar = this.defaultAvatar;
          this.angularFireStore
            .collection('users')
            .doc(response.user.uid)
            .set({
              firstName,
              lastName,
              email,
              avatar,
            })
            .then(() => {
              this.angularFireStore
                .collection<UserData>('users')
                .doc(response.user.uid)
                .valueChanges()
                .subscribe((user) => {
                  if (user) {
                    this.currentUser = user;
                    this.currentUser$.next(this.currentUser);
                  }
                });
            })
            .catch((err) => console.log(err));
        }
      })
      .catch((err) => console.log(err));
  }

  get UserData(): Observable<firebase.default.User> {
    return this.userData;
  }

  signIn(email: string, password: string): void {
    this.angularFireAuth
      .signInWithEmailAndPassword(email, password)
      .then((response) => {
        this.userData = this.angularFireAuth.authState;
        this.angularFireStore
          .collection<UserData>('users')
          .doc(response.user.uid)
          .valueChanges()
          .subscribe((user) => {
            if (user) {
              this.currentUser = user;
              this.currentUser$.next(this.currentUser);
            }
          });
      })
      .catch((err) => console.log(err));
  }

  logOut() {
    this.angularFireAuth.signOut().then(() => {
      this.currentUser = null;
      this.currentUser$.next(this.currentUser);
      this.router.navigateByUrl('/login').then();
    });
  }

  searchUserInDatabase(user_id: string): Observable<UserData> {
    return this.angularFireStore
      .collection<UserData>('users')
      .doc<UserData>(user_id)
      .valueChanges();
  }
}

export interface UserData {
  firstName: string;
  lastName: string;
  avatar: string;
  email: string;
  id?: string;
}
