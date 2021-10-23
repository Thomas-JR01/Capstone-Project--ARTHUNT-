import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SiteAttemptComponent } from './site-attempt.component';

describe('SiteAttemptComponent', () => {
  let component: SiteAttemptComponent;
  let fixture: ComponentFixture<SiteAttemptComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SiteAttemptComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SiteAttemptComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
