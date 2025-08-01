import { describe, it, expect } from 'vitest';
import { readConfigFile } from '../../../src/utils';

describe('readConfigFile', () => {
  it('should return the configuration object', async () => {
    const config = await readConfigFile();
    expect(config).toBeTypeOf('object');
    expect(config.APIKEY).toBeDefined();
  });
});
