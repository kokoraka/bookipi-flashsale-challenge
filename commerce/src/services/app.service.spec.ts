import { AppService } from './app.service.js';

describe('AppService', () => {
  let service: AppService;

  beforeEach(() => {
    service = new AppService();
  });

  describe('getInfo', () => {
    it('should return the service name', () => {
      const result = service.getInfo();

      expect(result).toBe('Commerce Service');
    });
  });

  describe('getVersion', () => {
    it('should return the service version', () => {
      const result = service.getVersion();

      expect(result).toBe('0.0.1');
    });
  });
});