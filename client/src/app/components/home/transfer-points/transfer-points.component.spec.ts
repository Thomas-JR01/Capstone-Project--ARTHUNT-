import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransferPointsComponent } from './transfer-points.component';

describe('TransferPointsComponent', () => {
  let component: TransferPointsComponent;
  let fixture: ComponentFixture<TransferPointsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TransferPointsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TransferPointsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
