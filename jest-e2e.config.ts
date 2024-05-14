import type { JestConfigWithTsJest } from 'ts-jest';

import jestConfig from './jest.config';

export default <JestConfigWithTsJest>{
  ...jestConfig,
  testRegex: '.e2e-spec.ts$',
};
