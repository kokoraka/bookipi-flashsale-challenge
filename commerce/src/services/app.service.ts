import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getInfo(): string {
    return 'Commerce Service';
  }

  getVersion(): string {
    return '0.0.1';
  }
}
