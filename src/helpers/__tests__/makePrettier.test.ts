import makePrettier from '../makePrettier.js';

describe('makePrettier', () => {
  describe('makePrettierrc', () => {
    it('should return a valid prettierrc object', () => {
      const prettierrc = makePrettier.makePrettierrc();

      expect(prettierrc).toEqual({
        plugins: ['@trivago/prettier-plugin-sort-imports'],
        importOrderSeparation: true,
        importOrder: ['^[./]'],
        trailingComma: 'es5',
        tabWidth: 2,
        semi: true,
        singleQuote: true,
      });
    });
  });

  describe('makePrettierignore', () => {
    it('should return a valid prettierignore string', () => {
      const prettierignore = makePrettier.makePrettierignore();

      expect(prettierignore).toEqual(
        '.next' +
          `\n` +
          '.cache' +
          `\n` +
          'package-lock.json' +
          `\n` +
          'public' +
          `\n` +
          'node_modules' +
          `\n` +
          'next-env.d.ts' +
          `\n` +
          'next.config.ts' +
          `\n` +
          'yarn.lock'
      );
    });
  });
});
