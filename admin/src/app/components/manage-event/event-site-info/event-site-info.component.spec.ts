import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventSiteInfoComponent } from './event-site-info.component';

describe('EventSiteInfoComponent', () => {
  let component: EventSiteInfoComponent;
  let fixture: ComponentFixture<EventSiteInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EventSiteInfoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EventSiteInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
