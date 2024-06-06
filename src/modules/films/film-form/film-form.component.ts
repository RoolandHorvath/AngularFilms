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
      reziseri: this.fb.array([]),
      postavy: this.fb.array([])
    });
  }

  ngOnInit(): void {
    this.initializeForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['film'] && this.film) {
      this.isEdit = true;
      this.initializeForm();
    } else {
      this.isEdit = false;
    }
  }  

  initializeForm(): void {
    if (this.film && this.film.id) {
      this.isEdit = true;
      this.filmForm.patchValue(this.film);
      this.setFormArrays('reziseri', this.film.reziser || []);
      this.setFormArrays('postavy', this.film.postava || []);
    } else {
      this.isEdit = false;
    }
    console.log('Component mode isEdit:', this.isEdit);
  }  

  setFormArrays(key: 'reziseri' | 'postavy', items: any[]): void {
    const array = items.map(item => 
      key === 'reziseri' ? this.createPersonFormGroup(item as Person) : this.createPostavaFormGroup(item as Postava)
    );
    this.filmForm.setControl(key, this.fb.array(array));
  }

  get reziseri(): FormArray {
    return this.filmForm.get('reziseri') as FormArray;
  }

  get postavy(): FormArray {
    return this.filmForm.get('postavy') as FormArray;
  }

  addReziser(): void {
    this.reziseri.push(this.createPersonFormGroup(new Person(0, '', '', '')));
  }

  removeReziser(index: number): void {
    this.reziseri.removeAt(index);
  }

  addPostava(): void {
    this.postavy.push(this.createPostavaFormGroup(new Postava('', 'hlavná postava', new Person(0, '', '', ''))));
  }

  removePostava(index: number): void {
    this.postavy.removeAt(index);
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
    console.log('Submitting form with value:', this.filmForm.value);
  
    if (this.filmForm.valid) {
      if (this.isEdit && this.film?.id) {
        console.log('Updating film with ID:', this.film.id);
        this.filmsService.updateFilm({...this.filmForm.value, id: this.film.id})
          .subscribe({
            next: (updatedFilm: Film) => { // Assuming Film is your data model
              console.log('Film updated successfully:', updatedFilm);
              // Handle successful update
            },
            error: (error: any) => { // Consider defining a more specific error type
              console.error('Error updating film:', error);
            }
          });
      } else {
        console.log('Creating new film');
        this.filmsService.addFilm(this.filmForm.value)
          .subscribe({
            next: (newFilm: Film) => { // Assuming Film is your data model
              console.log('Film added successfully:', newFilm);
              // Handle successful creation
            },
            error: (error: any) => { // Consider defining a more specific error type
              console.error('Error adding new film:', error);
            }
          });
      }
    } else {
      console.error('Form is invalid:', this.filmForm.errors);
    }
  }
  
}