import { Test, TestingModule } from '@nestjs/testing';
import { CourseworkService } from './coursework.service';

describe('CourseworkService', () => {
  let service: CourseworkService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CourseworkService],
    }).compile();

    service = module.get<CourseworkService>(CourseworkService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
