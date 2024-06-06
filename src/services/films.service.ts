import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Film } from '../entities/film';
import { UsersService } from './users.service';
import { environment } from '../environments/environment';

export interface FilmsResponse {
  items: Film[];
  totalCount: number;
}

@Injectable({
  providedIn: 'root'
})
export class FilmsService {
  usersService = inject(UsersService);
  http = inject(HttpClient);
  url = environment.serverUrl;
  get token() {
    return this.usersService.token;
  }

  getTokenHeader(): { headers?: { [header: string]: string }, params?: HttpParams } | undefined {
    if (!this.token) {
      return undefined;
    }
    return { headers: { 'X-Auth-Token': this.token } };
  }

  getFilms(orderBy?: string, descending?: boolean, indexFrom?: number, indexTo?: number, search?: string): Observable<FilmsResponse> {
    let options = this.getTokenHeader();
    if (orderBy || descending || indexFrom || indexTo || search) {
      options = { ...(options || {}), params: new HttpParams() };
    }
    if (options && options.params) {
      if (orderBy) {
        options.params = options.params.set('orderBy', orderBy);
      }
      if (descending) {
        options.params = options.params.set('descending', descending);
      }
      if (indexFrom) {
        options.params = options.params.set('indexFrom', indexFrom);
      }
      if (indexTo) {
        options.params = options.params.set('indexTo', indexTo);
      }
      if (search) {
        options.params = options.params.set('search', search);
      }
    }
    return this.http.get<FilmsResponse>(`${this.url}films`, options).pipe(
      catchError(this.handleError)
    );
  }

  addFilm(film: Film): Observable<Film> {
    console.log('Adding new film with data:', film);
    return this.http.post<Film>(`${this.url}films`, film, this.getTokenHeader()).pipe(
      tap(response => console.log('Response from adding film:', response)),
      catchError(this.handleError)
    );
  }
  
  updateFilm(film: Film): Observable<Film> {
    console.log('Updating film with ID:', film.id, 'Data:', film);
    return this.http.put<Film>(`${this.url}films/${film.id}`, film, this.getTokenHeader()).pipe(
      tap(response => console.log('Response from updating film:', response)),
      catchError(this.handleError)
    );
  }
  
  getFilm(id: number): Observable<Film> {
    return this.http.get<Film>(`${this.url}films/${id}`).pipe(
      catchError(err => {
        console.error(`Error fetching film with ID ${id}:`, err);
        return throwError(() => new Error('Failed to fetch film'));
      }),
      tap(film => {
        if (!film) console.log(`No film found with ID ${id}`);
      })
    );
  }
  
  private handleError(error: HttpErrorResponse): Observable<never> {
    console.error('An error occurred:', error.message, 'Error details:', error);
    return throwError(() => new Error('Something went wrong; please try again later.'));
  }
}