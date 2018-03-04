import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { UserService } from '../services/user.service';
import { GlobalService } from '../services/global.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  providers: [UserService]
})
export class LoginComponent implements OnInit {

  userLogin: FormGroup;
  loading: boolean;

  constructor(private fb: FormBuilder, private router: Router,
     private userService: UserService, private global: GlobalService) {
    this.userLogin = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.loading = false;
    if ( localStorage.getItem('token') && localStorage.getItem('account')) {
      this.global.me = JSON.parse(localStorage.getItem('account'));
      this.router.navigate(['/home']);
    }
  }
  onLogin() {
    this.loading = true;
    this.userService.loginUser(this.userLogin.value).subscribe(
      response => {
        this.loading = false;
        localStorage.setItem('token', response['token']);
        this.global.me = response['user'];
        this.router.navigate(['/home']);
      },
      error => {
        this.loading = false;
        console.log('error', error);
      }
    );
  }
}
