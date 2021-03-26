import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import * as firebase from 'firebase';

@Injectable({
  providedIn: 'root',
})
export class PostService {
  currentUser: firebase.default.User;

  constructor(
    private angularFireStore: AngularFirestore,
    private angularFireAuth: AngularFireAuth
  ) {
    angularFireAuth.authState.subscribe((user) => (this.currentUser = user));
  }

  getAllPosts(): Observable<any> {
    return this.angularFireStore
      .collection<any>('posts', (ref) => ref.orderBy('time', 'desc'))
      .snapshotChanges()
      .pipe(
        map((actions) => {
          return actions.map((item) => {
            return {
              id: item.payload.doc.id,
              ...item.payload.doc.data(),
            };
          });
        })
      );
  }

  postMessage(message, ownerName, otherItems) {
    this.angularFireStore
      .collection('posts')
      .add({
        message,
        title: ownerName,
        user_id: this.currentUser.uid,
        time: firebase.default.firestore.FieldValue.serverTimestamp(),
        ...otherItems,
      })
      .then((response) => console.log(response))
      .catch((err) => console.log(err));
  }
}
