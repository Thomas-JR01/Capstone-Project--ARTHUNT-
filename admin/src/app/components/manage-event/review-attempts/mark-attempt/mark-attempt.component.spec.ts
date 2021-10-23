import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MarkAttemptComponent } from './mark-attempt.component';

describe('MarkAttemptComponent', () => {
  let component: MarkAttemptComponent;
  let fixture: ComponentFixture<MarkAttemptComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MarkAttemptComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MarkAttemptComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
