import { Injectable } from '@nestjs/common';
import { parse, v7 } from 'uuid';
import { Status } from '../entities/status/Status.js';
import { StatusCode } from '../entities/status/StatusCode.js';

export const SERVICE_ID_GENERATOR = Symbol('SERVICE_ID_GENERATOR');

export interface IdGeneratorInterface {
  generateIds(n: number): GenerateIdResult
}

type GenerateIdResult = {
  status: Status
  ids?: Id[]
}

type Id = {
  text: string
  binary: Buffer<ArrayBuffer>
}

@Injectable()
export class UuidGeneratorService implements IdGeneratorInterface {
  generateIds(n: number): GenerateIdResult {
    try {

      const ids: Id[] = []
      for (let i = 0; i < n; i++) {
        const text = v7();
        const binary = Buffer.from(parse(text));
        ids.push({ text, binary })
      }

      return {
        status: new Status(StatusCode.SUCCESS, 'success generate id'),
        ids
      }
    } catch (e: unknown) {
      return {
        status: Status.fromError(e),
      };
    }
  }
}
