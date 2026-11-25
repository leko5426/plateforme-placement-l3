import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SuiviEmployeurComponent } from './suivi-employeur.component';

describe('SuiviEmployeurComponent', () => {
  let component: SuiviEmployeurComponent;
  let fixture: ComponentFixture<SuiviEmployeurComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SuiviEmployeurComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SuiviEmployeurComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
