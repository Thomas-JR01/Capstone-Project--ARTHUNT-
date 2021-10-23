import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeleteEventConfirmationComponent } from './delete-event-confirmation.component';

describe('DeleteEventConfirmationComponent', () => {
  let component: DeleteEventConfirmationComponent;
  let fixture: ComponentFixture<DeleteEventConfirmationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DeleteEventConfirmationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DeleteEventConfirmationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
