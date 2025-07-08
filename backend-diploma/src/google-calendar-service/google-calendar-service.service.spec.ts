import { Test, TestingModule } from '@nestjs/testing';
import { GoogleCalendarServiceService } from './google-calendar-service.service';

describe('GoogleCalendarServiceService', () => {
  let service: GoogleCalendarServiceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GoogleCalendarServiceService],
    }).compile();

    service = module.get<GoogleCalendarServiceService>(GoogleCalendarServiceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
