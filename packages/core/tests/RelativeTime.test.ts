import { describe, expect, it } from 'vitest';
import { BSDay, relativeTimePlugin } from '../src';

BSDay.extend(relativeTimePlugin);

describe('RelativeTimePlugin', () => {
  it('formats relative time in English', () => {
    const now = BSDay.now();
    const past = now.subtract(2, 'day');
    const future = now.add(1, 'month');

    expect((past as any).fromNow()).toBe('2 days ago');
    expect((future as any).fromNow()).toBe('in a month');
  });

  it('formats relative time in Nepali', () => {
    const now = BSDay.now().locale('ne') as any;
    const past = now.subtract(2, 'day');
    const future = now.add(1, 'month');

    expect(past.fromNow()).toBe('२ दिन अघि');
    expect(future.fromNow()).toBe('एक महिना पछि');
  });

  it('supports from() and to() methods', () => {
    const a = BSDay.fromBS([2082, 1, 1]);
    const b = BSDay.fromBS([2082, 1, 10]);

    expect((a as any).to(b)).toBe('in 9 days');
    expect((a as any).from(b)).toBe('9 days ago');
    
    expect((a as any).to(b, true)).toBe('9 days');
  });
});
