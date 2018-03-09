import { Component, OnInit } from '@angular/core';
import { User } from '../models/user';
import { Subscription } from 'rxjs/Subscription';
import { GlobalService } from '../services/global.service';
import { Router } from '@angular/router';
import { MovieService } from '../services/movie.service';
import { Movie } from '../models/movie';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { MatSnackBar } from '@angular/material';
import { RatingService } from '../services/rating.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  providers: [MovieService, RatingService]
})
export class HomeComponent implements OnInit {

  account: User = new User();
  userSub: Subscription;
  movies;
  selectedMovie: Movie;
  movieInput: FormGroup;
  isAddEditMode: boolean;
  isEdit: boolean;
  my_rating: number;

  constructor(private global: GlobalService, private router: Router,
    private movieService: MovieService, private fb: FormBuilder,
    public snackBar: MatSnackBar, private ratingsService: RatingService) { }

  ngOnInit() {
    this.userSub = this.global.user.subscribe(
      me => this.account = me
    );
    if ( localStorage.getItem('token') && localStorage.getItem('account')) {
      this.global.me = JSON.parse(localStorage.getItem('account'));
      this.getMovies();
    } else {
      this.router.navigate(['/login']);
    }
    this.isAddEditMode = false;
    this.isEdit = false;
    this.movieInput = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required]
    });
    this.my_rating = 3;
  }
  getMovies() {
    this.movieService.getMovies().subscribe(
      response => {
        this.movies = response;
      },
      error => {
        this.snackBar.open('Error getting Movies', '', { duration: 3000 });
      }
    );
  }
  editMovieClicked() {
    this.isEdit = true;
    this.isAddEditMode = true;
    this.movieInput = this.fb.group({
      title: [this.selectedMovie.title, Validators.required],
      description: [this.selectedMovie.description, Validators.required]
    });
  }
  addMovieClicked() {
    this.isEdit = false;
    this.isAddEditMode = true;
    this.selectedMovie = null;
    this.movieInput.reset();
  }
  submitMovie() {
    if (this.isEdit) {
      this.movieService.editMovie(this.movieInput.value, this.selectedMovie.id).subscribe(
        response => {
          const movIndx = this.movies.map(function(e) {return e.id; }).indexOf(this.selectedMovie.id);
          if (movIndx >= 0) {
            this.movies[movIndx] = response;
            this.selectedMovie = response;
          }
          this.movieInput.reset();
          this.isAddEditMode = false;
        },
        error => {
          this.snackBar.open('Error edit Movie', '', { duration: 3000 });
        }
      );
    } else {
      this.movieService.addMovie(this.movieInput.value).subscribe(
        response => {
          this.movies.push(response);
          this.movieInput.reset();
          this.isAddEditMode = false;
        },
        error => {
          this.snackBar.open('Error adding Movie', '', { duration: 3000 });
        }
      );
    }
  }
  deleteMovieClicked() {
    this.movieService.deleteMovie(this.selectedMovie.id).subscribe(
      response => {
        const movIndx = this.movies.map(function(e) {return e.id; }).indexOf(this.selectedMovie.id);
        if (movIndx >= 0) {
          this.movies.splice(movIndx, 1);
          this.selectedMovie = null;
        }
        this.isAddEditMode = false;
      },
      error => {
        this.snackBar.open('Error deleting Movie', '', { duration: 3000 });
      }
    );
  }
  movieClicked(movie: Movie) {
    this.selectedMovie = movie;
    this.isAddEditMode = false;
  }
  newRate(my_rating) {
    this.ratingsService.addRating(this.account.id, this.selectedMovie.id, my_rating).subscribe(
      data => {
        const movieIndx = this.movies.map(function(e) {return e.id; }).indexOf(this.selectedMovie.id);
        if (movieIndx >= 0) {
          this.movies[movieIndx] = data['result'];
        }
        this.selectedMovie = data['result'];
      },
      error => this.snackBar.open('Error. Please Try Again.', '', { duration: 3000 })
    );
  }
  logoutClicked() {
    this.global.me = new User();
    localStorage.removeItem('token');
    localStorage.removeItem('account');
    this.router.navigate(['/login']);
  }
}
