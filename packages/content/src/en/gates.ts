import type { GateContent } from '../types';
import { gates as part1 } from './gates/part1';
import { gates as part2 } from './gates/part2';

export const gates: Record<number, GateContent> = { ...part1, ...part2 };
