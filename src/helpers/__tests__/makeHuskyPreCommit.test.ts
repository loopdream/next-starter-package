import { PackageManagerKindEnum } from '../../PackageManager.js';
import makeHuskyPreCommit, { huskyFragments } from '../makeHuskyPreCommit.js';

describe('makeHuskyPreCommit', () => {
  it('should return a valid pre-commit hook script without lint-staged', () => {
    const script = makeHuskyPreCommit({
      eslint: true,
      jest: true,
      lintStaged: false,
      packageManager: PackageManagerKindEnum.NPM,
      prettier: true,
      typescript: true,
    });

    const expected = [
      huskyFragments.head,
      huskyFragments.prettier,
      huskyFragments.eslint,
      huskyFragments.jest,
      huskyFragments.typescript,
      huskyFragments.leasot,
      huskyFragments.footer,
    ]
      .join('\n')
      .replace(/<PACKAGE_MANAGER>/g, PackageManagerKindEnum.NPM);

    expect(script).toEqual(expected);
  });

  describe('when lint-staged is enabled', () => {
    it('should return a valid pre-commit hook script', () => {
      const options = {
        eslint: true,
        jest: true,
        lintStaged: true,
        packageManager: PackageManagerKindEnum.NPM,
        prettier: true,
        typescript: true,
      };

      const expected = [
        huskyFragments.head,
        huskyFragments.lintStaged,
        huskyFragments.leasot,
        huskyFragments.footer,
      ]
        .join('\n')
        .replace(/<PACKAGE_MANAGER>/g, PackageManagerKindEnum.NPM);

      const script = makeHuskyPreCommit(options);

      expect(script).toEqual(expected);
    });
  });

  describe('When the package manager is Yarn', () => {
    it('should use yarn for the commands', () => {
      const options = {
        eslint: true,
        jest: true,
        lintStaged: false,
        packageManager: PackageManagerKindEnum.YARN,
        prettier: true,
        typescript: true,
      };

      const script = makeHuskyPreCommit(options);

      expect(script).toContain('yarn run lint:fix');
      expect(script).toContain('yarn run format:write');
      expect(script).toContain('yarn run test --passWithNoTests');
      expect(script).toContain('yarn run build --no-emit');
    });
  });

  describe('When the package manager is Npm', () => {
    it('should use Npm for the commands', () => {
      const options = {
        eslint: true,
        jest: true,
        lintStaged: false,
        packageManager: PackageManagerKindEnum.NPM,
        prettier: true,
        typescript: true,
      };

      const script = makeHuskyPreCommit(options);

      expect(script).toContain('npm run lint:check');
      expect(script).toContain('npm run lint:fix');
      expect(script).toContain('npm run format:check');
      expect(script).toContain('npm run format:write');
      expect(script).toContain('npm run test --passWithNoTests');
      expect(script).toContain('npm run build --no-emit');
    });
  });

  describe('When the package manager is Bun', () => {
    it('should use Bun for the commands', () => {
      const options = {
        eslint: true,
        jest: true,
        lintStaged: false,
        packageManager: PackageManagerKindEnum.BUN,
        prettier: true,
        typescript: true,
      };

      const script = makeHuskyPreCommit(options);

      expect(script).toContain('bun run lint:check');
      expect(script).toContain('bun run lint:fix');
      expect(script).toContain('bun run format:check');
      expect(script).toContain('bun run format:write');
      expect(script).toContain('bun run test --passWithNoTests');
      expect(script).toContain('bun run build --no-emit');
    });
  });

  describe('When the package manager is Pnpm', () => {
    it('should use Pnpm for the commands', () => {
      const options = {
        eslint: true,
        jest: true,
        lintStaged: false,
        packageManager: PackageManagerKindEnum.PNPM,
        prettier: true,
        typescript: true,
      };

      const script = makeHuskyPreCommit(options);

      expect(script).toContain('pnpm run lint:check');
      expect(script).toContain('pnpm run lint:fix');
      expect(script).toContain('pnpm run format:check');
      expect(script).toContain('pnpm run format:write');
      expect(script).toContain('pnpm run test --passWithNoTests');
      expect(script).toContain('pnpm run build --no-emit');
    });
  });

  describe('when lint-staged is disabled', () => {
    describe('when prettier, eslint, jest, and typescript are enabled', () => {
      it('should return a valid pre-commit hook script', () => {
        const options = {
          eslint: true,
          jest: true,
          lintStaged: false,
          packageManager: PackageManagerKindEnum.NPM,
          prettier: true,
          typescript: true,
        };

        const expected = [
          huskyFragments.head,
          huskyFragments.prettier,
          huskyFragments.eslint,
          huskyFragments.jest,
          huskyFragments.typescript,
          huskyFragments.leasot,
          huskyFragments.footer,
        ]
          .join('\n')
          .replace(/<PACKAGE_MANAGER>/g, PackageManagerKindEnum.NPM);

        const script = makeHuskyPreCommit(options);

        expect(script).toEqual(expected);
      });
    });

    describe('when prettier, eslint, jest, are enabled', () => {
      it('should return a valid pre-commit hook script', () => {
        const options = {
          eslint: true,
          jest: true,
          lintStaged: false,
          packageManager: PackageManagerKindEnum.NPM,
          prettier: true,
          typescript: false,
        };

        const expected = [
          huskyFragments.head,
          huskyFragments.prettier,
          huskyFragments.eslint,
          huskyFragments.jest,
          huskyFragments.leasot,
          huskyFragments.footer,
        ]
          .join('\n')
          .replace(/<PACKAGE_MANAGER>/g, PackageManagerKindEnum.NPM);

        const script = makeHuskyPreCommit(options);

        expect(script).toEqual(expected);
      });
    });

    describe('when prettier, eslint, typescript, are enabled', () => {
      it('should return a valid pre-commit hook script', () => {
        const options = {
          eslint: true,
          jest: false,
          lintStaged: false,
          packageManager: PackageManagerKindEnum.NPM,
          prettier: true,
          typescript: true,
        };

        const expected = [
          huskyFragments.head,
          huskyFragments.prettier,
          huskyFragments.eslint,
          huskyFragments.typescript,
          huskyFragments.leasot,
          huskyFragments.footer,
        ]
          .join('\n')
          .replace(/<PACKAGE_MANAGER>/g, PackageManagerKindEnum.NPM);

        const script = makeHuskyPreCommit(options);

        expect(script).toEqual(expected);
      });
    });

    describe('when prettier, eslint, are enabled', () => {
      it('should return a valid pre-commit hook script', () => {
        const options = {
          eslint: true,
          jest: false,
          lintStaged: false,
          packageManager: PackageManagerKindEnum.NPM,
          prettier: true,
          typescript: false,
        };

        const expected = [
          huskyFragments.head,
          huskyFragments.prettier,
          huskyFragments.eslint,
          huskyFragments.leasot,
          huskyFragments.footer,
        ]
          .join('\n')
          .replace(/<PACKAGE_MANAGER>/g, PackageManagerKindEnum.NPM);

        const script = makeHuskyPreCommit(options);

        expect(script).toEqual(expected);
      });
    });

    describe('when only prettier is enabled', () => {
      it('should return a valid pre-commit hook script', () => {
        const options = {
          eslint: false,
          jest: false,
          lintStaged: false,
          packageManager: PackageManagerKindEnum.NPM,
          prettier: true,
          typescript: false,
        };

        const expected = [
          huskyFragments.head,
          huskyFragments.prettier,
          huskyFragments.leasot,
          huskyFragments.footer,
        ]
          .join('\n')
          .replace(/<PACKAGE_MANAGER>/g, PackageManagerKindEnum.NPM);

        const script = makeHuskyPreCommit(options);

        expect(script).toEqual(expected);
      });
    });

    describe('when only eslint is enabled', () => {
      it('should return a valid pre-commit hook script', () => {
        const options = {
          eslint: true,
          jest: false,
          lintStaged: false,
          packageManager: PackageManagerKindEnum.NPM,
          prettier: false,
          typescript: false,
        };

        const expected = [
          huskyFragments.head,
          huskyFragments.eslint,
          huskyFragments.leasot,
          huskyFragments.footer,
        ]
          .join('\n')
          .replace(/<PACKAGE_MANAGER>/g, PackageManagerKindEnum.NPM);

        const script = makeHuskyPreCommit(options);

        expect(script).toEqual(expected);
      });
    });

    describe('when only typescript is enabled', () => {
      it('should return a valid pre-commit hook script', () => {
        const options = {
          eslint: false,
          jest: false,
          lintStaged: false,
          packageManager: PackageManagerKindEnum.NPM,
          prettier: false,
          typescript: true,
        };

        const expected = [
          huskyFragments.head,
          huskyFragments.typescript,
          huskyFragments.leasot,
          huskyFragments.footer,
        ]
          .join('\n')
          .replace(/<PACKAGE_MANAGER>/g, PackageManagerKindEnum.NPM);

        const script = makeHuskyPreCommit(options);

        expect(script).toEqual(expected);
      });
    });

    describe('when only some checks are enabled', () => {
      it('should return a valid pre-commit hook script', () => {
        const options = {
          eslint: true,
          jest: false,
          lintStaged: false,
          packageManager: PackageManagerKindEnum.NPM,
          prettier: false,
          typescript: true,
        };

        const expected = [
          huskyFragments.head,
          huskyFragments.eslint,
          huskyFragments.typescript,
          huskyFragments.leasot,
          huskyFragments.footer,
        ]
          .join('\n')
          .replace(/<PACKAGE_MANAGER>/g, PackageManagerKindEnum.NPM);

        const script = makeHuskyPreCommit(options);

        expect(script).toEqual(expected);
      });
    });

    describe('when all checks are disabled', () => {
      it('should return a valid pre-commit hook script', () => {
        const options = {
          eslint: false,
          jest: false,
          lintStaged: false,
          packageManager: PackageManagerKindEnum.NPM,
          prettier: false,
          typescript: false,
        };

        const expected = [
          huskyFragments.head,
          huskyFragments.leasot,
          huskyFragments.footer,
        ]
          .join('\n')
          .replace(/<PACKAGE_MANAGER>/g, PackageManagerKindEnum.NPM);

        const script = makeHuskyPreCommit(options);

        expect(script).toEqual(expected);
      });
    });
  });
});
