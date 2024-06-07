import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray, ReactiveFormsModule } from '@angular/forms';
import { Film } from '../../../entities/film';
import { Person } from '../../../entities/person';
import { Postava } from '../../../entities/postava';
import { FilmsService } from '../../../services/films.service';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-film-form',
  templateUrl: './film-form.component.html',
  styleUrls: ['./film-form.component.css'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatTooltipModule
  ],
  standalone: true
})
export class FilmFormComponent implements OnInit, OnChanges {
  @Input() film?: Film;
  @Output() formSubmit: EventEmitter<Film> = new EventEmitter<Film>();
  filmForm: FormGroup;
  isEdit: boolean = false;

  constructor(private fb: FormBuilder, private filmsService: FilmsService) {
    this.filmForm = this.fb.group({
      nazov: ['', Validators.required],
      rok: ['', [Validators.required, Validators.min(1850)]],
      slovenskyNazov: [''],
      imdbID: [''],
      afi1998: [''],
      afi2007: [''],
      reziser: this.fb.array([]),
      postava: this.fb.array([])
    });
  }

  ngOnInit(): void {
    this.initializeForm(this.film);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['film'] && this.film) {
      this.isEdit = true;
      this.initializeForm(this.film);
    } else {
      this.isEdit = false;
    }
  }

  initializeForm(film?: Film): void {
    if (film && film.id) {
      this.isEdit = true;
      const { nazov, rok, slovenskyNazov, imdbID, poradieVRebricku, reziser, postava } = film;
      this.filmForm.patchValue({
        nazov,
        rok,
        slovenskyNazov,
        imdbID,
        afi1998: poradieVRebricku?.['AFI 1998'],
        afi2007: poradieVRebricku?.['AFI 2007']
      });
      this.setFormArrays('reziser', reziser || []);
      this.setFormArrays('postava', postava || []);
    } else {
      this.isEdit = false;
    }
  }

  setFormArrays(key: 'reziser' | 'postava', items: any[]): void {
    const array = items.map(item =>
      key === 'reziser' ? this.createPersonFormGroup(item as Person) : this.createPostavaFormGroup(item as Postava)
    );
    this.filmForm.setControl(key, this.fb.array(array));
  }

  get reziser(): FormArray {
    return this.filmForm.get('reziser') as FormArray;
  }

  get postava(): FormArray {
    return this.filmForm.get('postava') as FormArray;
  }

  addReziser(): void {
    this.reziser.push(this.createPersonFormGroup(new Person(0, '', '', '')));
  }

  removeReziser(index: number): void {
    this.reziser.removeAt(index);
  }

  addPostava(): void {
    this.postava.push(this.createPostavaFormGroup(new Postava('', 'hlavná postava', new Person(0, '', '', ''))));
  }

  removePostava(index: number): void {
    this.postava.removeAt(index);
  }

  createPersonFormGroup(person: Person): FormGroup {
    return this.fb.group({
      krstneMeno: [person.krstneMeno, Validators.required],
      stredneMeno: [person.stredneMeno],
      priezvisko: [person.priezvisko, Validators.required],
      id: [person.id]
    });
  }

  createPostavaFormGroup(postava: Postava): FormGroup {
    return this.fb.group({
      postava: [postava.postava, Validators.required],
      dolezitost: [postava.dolezitost, Validators.required],
      herec: this.fb.group({
        krstneMeno: [postava.herec.krstneMeno, Validators.required],
        stredneMeno: [postava.herec.stredneMeno],
        priezvisko: [postava.herec.priezvisko, Validators.required],
        id: [postava.herec.id]
      })
    });
  }

  onSubmit(): void {
    if (this.filmForm.valid) {
      const formValue = this.filmForm.value;
      const filmData: Film = {
        ...formValue,
        poradieVRebricku: {
          "AFI 1998": formValue.afi1998,
          "AFI 2007": formValue.afi2007
        },
        id: this.film?.id
      };

      if (this.isEdit && this.film?.id) {
        this.filmsService.updateFilm(filmData).subscribe({
          next: (updatedFilm: Film) => {
            this.formSubmit.emit(updatedFilm);
          },
          error: (error: any) => {
            console.error('Error updating film:', error);
          }
        });
      } else {
        this.filmsService.addFilm(filmData).subscribe({
          next: (newFilm: Film) => {
            this.formSubmit.emit(newFilm);
          },
          error: (error: any) => {
            console.error('Error adding new film:', error);
          }
        });
      }
    } else {
      console.error('Form is invalid:', this.filmForm.errors);
    }
  }
}