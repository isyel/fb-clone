import { Component, OnDestroy, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { NgForm } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import { RegisterComponent } from '../register/register.component';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit, OnDestroy {
  subs: Subscription[] = [];

  constructor(
    private authService: AuthService,
    private angularFireAuth: AngularFireAuth,
    private router: Router,
    private matDialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.subs.push(
      this.authService.UserData.subscribe((user) => {
        if (user) {
          this.router.navigateByUrl('/').then();
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subs.map((s) => s.unsubscribe());
  }

  login(form: NgForm) {
    const { email, password } = form.value;
    this.authService.signIn(email, password);
    form.resetForm();
  }

  openRegisterForm() {
    const dialogRef = this.matDialog.open(RegisterComponent, {
      role: 'dialog',
      height: '480px',
      width: '480px',
    });

    dialogRef.afterClosed().subscribe((result) => {
      console.log(result);

      if (result !== undefined) {
        const { firstName, lastName, email, password, avatar } = result;
        this.authService.signUp(email, password, firstName, lastName, avatar);
      } else return;
    });

    return;
  }
}
