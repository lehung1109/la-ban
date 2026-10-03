import { describe, it, expect } from 'vitest';
import HomePage from '@/app/page';

describe('Environment setup', () => {
  it('verifies test runner is operational', () => {
    expect(true).toBe(true);
  });

  it('verifies path alias @/ resolves properly', () => {
    expect(HomePage).toBeDefined();
  });
});
