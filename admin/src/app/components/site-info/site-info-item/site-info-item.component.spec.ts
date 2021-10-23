import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SiteInfoItemComponent } from './site-info-item.component';

describe('SiteInfoItemComponent', () => {
  let component: SiteInfoItemComponent;
  let fixture: ComponentFixture<SiteInfoItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SiteInfoItemComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SiteInfoItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
