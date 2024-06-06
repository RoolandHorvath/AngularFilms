import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FilmsAddEditComponent } from './films-add-edit.component';

describe('FilmsAddEditComponent', () => {
  let component: FilmsAddEditComponent;
  let fixture: ComponentFixture<FilmsAddEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FilmsAddEditComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FilmsAddEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
