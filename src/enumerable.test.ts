import test from 'ava';

import Enumerable from './enumerable';

test('Range', t => {
  t.deepEqual(
    Enumerable.RANGE(1, 10)
      .select(x => x * x)
      .toArray(),
    [1, 4, 9, 16, 25, 36, 49, 64, 81, 100]
  );
});

test('Repeat', t => {
  const str = 'I like programming';
  const test = Enumerable.REPEAT(str, 3);
  t.is(test.elementAt(0), str);
  t.is(test.elementAt(1), str);
  t.is(test.elementAt(2), str);
});
