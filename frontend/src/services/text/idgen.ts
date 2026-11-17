import { parse, v7 } from 'uuid';
import { Status } from '../../status';
import { StatusCode } from '../../status';

type GenerateIdResult = {
  status: Status
  ids?: Id[]
}

type Id = {
  text: string
  binary: Buffer<ArrayBuffer>
}

export function generateIds(n: number): GenerateIdResult {
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
