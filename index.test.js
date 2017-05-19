/* eslint-env jest */
const fs = require('mz/fs');
const correlatePatch = require('./');

const encoding = 'utf8';
const _ = undefined;

test('should correlate a single commit patch', () => fs
  .readFile('./test-files/single.patch', { encoding })
  .then((content) => {
    const hash = '8b19b6327415d4d2b2dc6ed5a987d8685f8b5c7b';
    const correlation = correlatePatch(content);
    expect(correlation).toMatchObject({
      'test.js': {
        oldLines: [
          _,
          hash,
          _,
          hash,
          _,
          _,
          hash,
        ],
        newLines: [
          _,
          [hash],
          [hash],
          _,
          [hash],
          _,
          _,
          [hash],
        ],
      },
    });
  }),
);

test('should correlate a multi commit patch', () => fs
  .readFile('./test-files/multi.patch', { encoding })
  .then((content) => {
    const hash1 = '8b19b6327415d4d2b2dc6ed5a987d8685f8b5c7b';
    const hash2 = 'd95ee564562c5a2fc9aa1345cbeb794d640962cd';
    const hash3 = '3467806ada06a706e760a6d780678a67e80678d9';
    const correlation = correlatePatch(content);
    expect(correlation).toMatchObject({
      'test.js': {
        oldLines: [
          hash3,
          hash1,
          hash2,
          hash1,
          _,
          _,
          hash1,
          _,
          _,
          hash3,
          _,
        ],
        newLines: [
          [hash3],
          [hash2, hash1],
          [hash2, hash1],
          [hash2],
          [hash1],
          _,
          _,
          [hash2, hash1],
          _,
          _,
          [hash3],
        ],
      },
    });
  }),
);
