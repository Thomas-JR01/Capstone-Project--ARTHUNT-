import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventSiteInfoItemComponent } from './event-site-info-item.component';

describe('EventSiteInfoItemComponent', () => {
  let component: EventSiteInfoItemComponent;
  let fixture: ComponentFixture<EventSiteInfoItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EventSiteInfoItemComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EventSiteInfoItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
