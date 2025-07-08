import { Test, TestingModule } from '@nestjs/testing';
import { CourseworkController } from './coursework.controller';

describe('CourseworkController', () => {
  let controller: CourseworkController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CourseworkController],
    }).compile();

    controller = module.get<CourseworkController>(CourseworkController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
