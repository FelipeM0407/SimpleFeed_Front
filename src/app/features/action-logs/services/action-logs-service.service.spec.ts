import { TestBed } from '@angular/core/testing';

import { ActionLogsServiceService } from './action-logs-service.service';

describe('ActionLogsServiceService', () => {
  let service: ActionLogsServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ActionLogsServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
