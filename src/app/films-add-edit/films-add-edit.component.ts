import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Film } from '../../entities/film';
import { FilmsService } from '../../services/films.service';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-films-add-edit',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatSnackBarModule,
    RouterModule
  ],
  templateUrl: './films-add-edit.component.html',
  styleUrls: ['./films-add-edit.component.css']
})
export class FilmsAddEditComponent {
  film: Film = new Film('', 0, '', '', [], [], {});

  constructor(private filmsService: FilmsService, private router: Router) {}

  onSubmit(form: NgForm) {
    //console.log('onSubmit called');
  
    if (form.valid) {

      const filmData: Film = form.value;

      const operation = filmData.id
        ? this.filmsService.updateFilm(filmData)
        : this.filmsService.addFilm(filmData);

      operation.subscribe({
        next: (result) => {
          console.log('Successful, result:', result);
          this.router.navigate(['/films']);
        },
        error: (error) => {
          console.error('Failed, error:', error);
        }
      });
    } else {
      console.error('Invalid form:', form.errors);
    }
  }

  getErrorMessage(field: any): string {
    if (field.errors.required) {
      return 'This field is required.';
    }
    return '';
  }
}