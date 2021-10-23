import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventSlideshowComponent } from './event-slideshow.component';

describe('EventSlideshowComponent', () => {
  let component: EventSlideshowComponent;
  let fixture: ComponentFixture<EventSlideshowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EventSlideshowComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EventSlideshowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
