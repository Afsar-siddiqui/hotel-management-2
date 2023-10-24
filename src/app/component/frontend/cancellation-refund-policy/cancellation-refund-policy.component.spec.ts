import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CancellationRefundPolicyComponent } from './cancellation-refund-policy.component';

describe('CancellationRefundPolicyComponent', () => {
  let component: CancellationRefundPolicyComponent;
  let fixture: ComponentFixture<CancellationRefundPolicyComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CancellationRefundPolicyComponent]
    });
    fixture = TestBed.createComponent(CancellationRefundPolicyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
