import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BrandEdit } from './brand-edit';

describe('BrandEdit', () => {
  let component: BrandEdit;
  let fixture: ComponentFixture<BrandEdit>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BrandEdit]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BrandEdit);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
