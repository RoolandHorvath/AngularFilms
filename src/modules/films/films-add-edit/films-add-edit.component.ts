import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Film } from '../../../entities/film';
import { FilmsService } from '../../../services/films.service';
import { HttpErrorResponse } from '@angular/common/http';
import { FilmFormComponent } from '../film-form/film-form.component';

@Component({
  selector: 'app-films-add-edit',
  templateUrl: './films-add-edit.component.html',
  styleUrls: ['./films-add-edit.component.css'],
  standalone: true,
  imports: [FilmFormComponent]
})
export class FilmsAddEditComponent implements OnInit {
  film?: Film;
  @ViewChild(FilmFormComponent) filmFormComponent?: FilmFormComponent;

  constructor(
    private filmsService: FilmsService, 
    private route: ActivatedRoute, 
    private router: Router
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.filmsService.getFilm(+id).subscribe({
        next: (data: Film) => {
          this.film = data;
          if (!data) {
            console.error('No film data found');
            this.router.navigate(['/films']);
            return;
          }
          this.filmFormComponent?.initializeForm();
        },
        error: (err: HttpErrorResponse) => {
          console.error('Error fetching film:', err.message);
          this.router.navigate(['/films']);
        }
      });
    } else {
      console.log('Adding new film - no ID provided');
      this.film = new Film('', 0, '', '', [], [], {});
      this.filmFormComponent?.initializeForm();
    }
  }

  ngAfterViewInit(): void {
    this.filmFormComponent?.initializeForm();
  }

  handleFormSubmit(film: Film): void {
    if (!film) {
      console.error('Submission attempted without a film object.');
      return;
    }
    const operation = film.id ? this.filmsService.updateFilm(film) : this.filmsService.addFilm(film);
    operation.subscribe({
      next: () => {
        console.log('Film saved successfully');
        this.router.navigate(['/films']);
      },
      error: (err: HttpErrorResponse) => {
        console.error('Error saving film:', err.message);
      }
    });
  }
}