import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StrategyItemComponent } from './strategy-item.component';

describe('StrategyItemComponent', () => {
  let component: StrategyItemComponent;
  let fixture: ComponentFixture<StrategyItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StrategyItemComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StrategyItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
