import { Test, TestingModule } from '@nestjs/testing';
import { GoogleCalendarServiceController } from './google-calendar-service.controller';

describe('GoogleCalendarServiceController', () => {
  let controller: GoogleCalendarServiceController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GoogleCalendarServiceController],
    }).compile();

    controller = module.get<GoogleCalendarServiceController>(GoogleCalendarServiceController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
