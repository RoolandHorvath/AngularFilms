import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
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
export class FilmsAddEditComponent implements OnInit, AfterViewInit {
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
            this.router.navigate(['/films']);
            return;
          }
        },
        error: (err: HttpErrorResponse) => {
          this.router.navigate(['/films']);
        }
      });
    } else {
      this.film = new Film('', 0, '', '', [], [], {});
    }
  }  

  ngAfterViewInit(): void {
    this.filmFormComponent?.initializeForm(this.film);
  }

  handleFormSubmit(film: Film): void {
    console.log(film)
    if (!film) {
      console.error('Submission attempted without a film object.');
      return;
    }
    this.router.navigate(['/films']);
  }
}