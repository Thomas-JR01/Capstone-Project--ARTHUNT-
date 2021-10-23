import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReviewAttemptsComponent } from './review-attempts.component';

describe('ReviewAttemptsComponent', () => {
  let component: ReviewAttemptsComponent;
  let fixture: ComponentFixture<ReviewAttemptsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReviewAttemptsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReviewAttemptsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
