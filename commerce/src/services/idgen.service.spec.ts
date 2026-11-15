
import { Test, TestingModule } from '@nestjs/testing';
import { parse, v7 } from 'uuid';
import { UuidGeneratorService } from './idgen.service.js';

vi.mock('uuid', async (importOriginal) => {
  const actual = await importOriginal<typeof import('uuid')>();

  return {
    ...actual,
    v7: vi.fn(),
  };
});

describe(UuidGeneratorService.name, () => {
  let service: UuidGeneratorService;

  const mockV7 = vi.mocked(v7);

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UuidGeneratorService],
    }).compile();

    service = module.get<UuidGeneratorService>(UuidGeneratorService);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('generateIds', () => {
    const uuid = '0190c8a0-1234-7000-8000-123456789abc';

    beforeEach(() => {
      // @ts-ignore
      mockV7.mockReturnValue(uuid);
    });

    it('should generate UUID v7', () => {
      const result = service.generateIds(1);
      const ids = result.ids ?? []

      expect(mockV7).toHaveBeenCalledOnce();
      expect(ids[0].text).toBe(uuid);
    });

    it('should return UUID as binary buffer', () => {
      const result = service.generateIds(1);
      const ids = result.ids ?? []

      expect(ids[0].binary).toBeInstanceOf(Buffer);
      expect(ids[0].binary).toEqual(Buffer.from(parse(uuid)));
    });

    it('should return a 16-byte binary UUID', () => {
      const result = service.generateIds(1);
      const ids = result.ids ?? []

      expect(ids[0].binary).toHaveLength(16);
    });

    it('should return both text and binary representations of the same UUID', () => {
      const result = service.generateIds(1);
      const ids = result.ids ?? []

      expect(ids[0]).toEqual({
        text: uuid,
        binary: Buffer.from(parse(uuid)),
      });
    });
  });
});
