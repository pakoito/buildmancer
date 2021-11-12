import { start } from './index';

test('10 gens', () => {
  const result = start(10);
  expect(result).toMatchSnapshot();
});
