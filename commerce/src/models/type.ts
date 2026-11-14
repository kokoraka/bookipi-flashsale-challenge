import { ValueTransformer } from 'typeorm';

export const EpochMillisecondsTransformer: ValueTransformer = {
  to(value: Date | null): number | null {
    return value ? value.getTime() : null;
  },

  from(value: string | number | null): Date | null {
    return value !== null ? new Date(Number(value)) : null;
  },
};
