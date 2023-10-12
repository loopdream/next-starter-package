import { PackageManagerKindEnum } from '../../PackageManager.js';
import makeHuskyPreCommit from '../makeHuskyPreCommit.js';

describe('makeHuskyPreCommit', () => {
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

      const expectedScript =
        '#!/usr/bin/env sh\n. "$(dirname -- "$0")/_/husky.sh"\n\n' +
        'npx lint-staged || { \n' +
        'printf "\n\n------------------------------------------\n\n"\n' +
        'printf "🚫 YOU HAVE ERRORS!" \n' +
        'printf "\n\n------------------------------------------\n\n";\n' +
        'exit 1;\n}\n\n' +
        '# Following is for observability purposes\n\n' +
        '# TODOs / FIXMEs\n' +
        'printf "\n\n"\n' +
        'printf "TODOs / FIXMEs - consider reviewing these"\n' +
        'printf "\n------------------------------------------\n"\n\n' +
        "npx leasot 'src/**/*.[jt]s?(x)' --exit-nicely\n\n" +
        'printf "\n\n------------------------------------------\n\n"\n' +
        'printf "Now push your code! 🚀"\n' +
        'printf "\n\n------------------------------------------\n\n"';

      const script = makeHuskyPreCommit(options);

      expect(script).toEqual(expectedScript);
    });
  });

  describe('when lint-staged is disabled', () => {
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

        expect(script).toContain('yarn run lint:check');
        expect(script).toContain('yarn run lint:fix');
        expect(script).toContain('yarn run format:check');
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

        const expectedScript =
          '#!/usr/bin/env sh\n. "$(dirname -- "$0")/_/husky.sh"\n\n' +
          'npm run format:check\n\n' +
          'npm run format:write\n\n' +
          'npm run lint:check\n\n' +
          'npm run lint:fix\n\n' +
          'npm run test --passWithNoTests\n\n' +
          'npm run build --no-emit\n\n' +
          '# Following is for observability purposes\n\n' +
          '# TODOs / FIXMEs\n' +
          'printf "\n\n"\n' +
          'printf "TODOs / FIXMEs - consider reviewing these"\n' +
          'printf "\n------------------------------------------\n"\n\n' +
          "npx leasot 'src/**/*.[jt]s?(x)' --exit-nicely\n\n" +
          'printf "\n\n------------------------------------------\n\n"\n' +
          'printf "Now push your code! 🚀"\n' +
          'printf "\n\n------------------------------------------\n\n"';

        const script = makeHuskyPreCommit(options);

        expect(script).toEqual(expectedScript);
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

        const expectedScript =
          '#!/usr/bin/env sh\n. "$(dirname -- "$0")/_/husky.sh"\n\n' +
          'npm run format:check\n\n' +
          'npm run format:write\n\n' +
          'npm run lint:check\n\n' +
          'npm run lint:fix\n\n' +
          'npm run test --passWithNoTests\n\n' +
          '# Following is for observability purposes\n\n' +
          '# TODOs / FIXMEs\n' +
          'printf "\n\n"\n' +
          'printf "TODOs / FIXMEs - consider reviewing these"\n' +
          'printf "\n------------------------------------------\n"\n\n' +
          "npx leasot 'src/**/*.[jt]s?(x)' --exit-nicely\n\n" +
          'printf "\n\n------------------------------------------\n\n"\n' +
          'printf "Now push your code! 🚀"\n' +
          'printf "\n\n------------------------------------------\n\n"';

        const script = makeHuskyPreCommit(options);

        expect(script).toEqual(expectedScript);
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

        const expectedScript =
          '#!/usr/bin/env sh\n. "$(dirname -- "$0")/_/husky.sh"\n\n' +
          'npm run format:check\n\n' +
          'npm run format:write\n\n' +
          'npm run lint:check\n\n' +
          'npm run lint:fix\n\n' +
          'npm run build --no-emit\n\n' +
          '# Following is for observability purposes\n\n' +
          '# TODOs / FIXMEs\n' +
          'printf "\n\n"\n' +
          'printf "TODOs / FIXMEs - consider reviewing these"\n' +
          'printf "\n------------------------------------------\n"\n\n' +
          "npx leasot 'src/**/*.[jt]s?(x)' --exit-nicely\n\n" +
          'printf "\n\n------------------------------------------\n\n"\n' +
          'printf "Now push your code! 🚀"\n' +
          'printf "\n\n------------------------------------------\n\n"';

        const script = makeHuskyPreCommit(options);

        expect(script).toEqual(expectedScript);
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

        const expectedScript =
          '#!/usr/bin/env sh\n. "$(dirname -- "$0")/_/husky.sh"\n\n' +
          'npm run format:check\n\n' +
          'npm run format:write\n\n' +
          'npm run lint:check\n\n' +
          'npm run lint:fix\n\n' +
          '# Following is for observability purposes\n\n' +
          '# TODOs / FIXMEs\n' +
          'printf "\n\n"\n' +
          'printf "TODOs / FIXMEs - consider reviewing these"\n' +
          'printf "\n------------------------------------------\n"\n\n' +
          "npx leasot 'src/**/*.[jt]s?(x)' --exit-nicely\n\n" +
          'printf "\n\n------------------------------------------\n\n"\n' +
          'printf "Now push your code! 🚀"\n' +
          'printf "\n\n------------------------------------------\n\n"';

        const script = makeHuskyPreCommit(options);

        expect(script).toEqual(expectedScript);
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

        const expectedScript =
          '#!/usr/bin/env sh\n. "$(dirname -- "$0")/_/husky.sh"\n\n' +
          'npm run format:check\n\n' +
          'npm run format:write\n\n' +
          '# Following is for observability purposes\n\n' +
          '# TODOs / FIXMEs\n' +
          'printf "\n\n"\n' +
          'printf "TODOs / FIXMEs - consider reviewing these"\n' +
          'printf "\n------------------------------------------\n"\n\n' +
          "npx leasot 'src/**/*.[jt]s?(x)' --exit-nicely\n\n" +
          'printf "\n\n------------------------------------------\n\n"\n' +
          'printf "Now push your code! 🚀"\n' +
          'printf "\n\n------------------------------------------\n\n"';

        const script = makeHuskyPreCommit(options);

        expect(script).toEqual(expectedScript);
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

        const expectedScript =
          '#!/usr/bin/env sh\n. "$(dirname -- "$0")/_/husky.sh"\n\n' +
          'npm run lint:check\n\n' +
          'npm run lint:fix\n\n' +
          '# Following is for observability purposes\n\n' +
          '# TODOs / FIXMEs\n' +
          'printf "\n\n"\n' +
          'printf "TODOs / FIXMEs - consider reviewing these"\n' +
          'printf "\n------------------------------------------\n"\n\n' +
          "npx leasot 'src/**/*.[jt]s?(x)' --exit-nicely\n\n" +
          'printf "\n\n------------------------------------------\n\n"\n' +
          'printf "Now push your code! 🚀"\n' +
          'printf "\n\n------------------------------------------\n\n"';

        const script = makeHuskyPreCommit(options);

        expect(script).toEqual(expectedScript);
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

        const expectedScript =
          '#!/usr/bin/env sh\n. "$(dirname -- "$0")/_/husky.sh"\n\n' +
          'npm run build --no-emit\n\n' +
          '# Following is for observability purposes\n\n' +
          '# TODOs / FIXMEs\n' +
          'printf "\n\n"\n' +
          'printf "TODOs / FIXMEs - consider reviewing these"\n' +
          'printf "\n------------------------------------------\n"\n\n' +
          "npx leasot 'src/**/*.[jt]s?(x)' --exit-nicely\n\n" +
          'printf "\n\n------------------------------------------\n\n"\n' +
          'printf "Now push your code! 🚀"\n' +
          'printf "\n\n------------------------------------------\n\n"';

        const script = makeHuskyPreCommit(options);

        expect(script).toEqual(expectedScript);
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

        const expectedScript =
          '#!/usr/bin/env sh\n. "$(dirname -- "$0")/_/husky.sh"\n\n' +
          'npm run lint:check\n\n' +
          'npm run lint:fix\n\n' +
          'npm run build --no-emit\n\n' +
          '# Following is for observability purposes\n\n' +
          '# TODOs / FIXMEs\n' +
          'printf "\n\n"\n' +
          'printf "TODOs / FIXMEs - consider reviewing these"\n' +
          'printf "\n------------------------------------------\n"\n\n' +
          "npx leasot 'src/**/*.[jt]s?(x)' --exit-nicely\n\n" +
          'printf "\n\n------------------------------------------\n\n"\n' +
          'printf "Now push your code! 🚀"\n' +
          'printf "\n\n------------------------------------------\n\n"';

        const script = makeHuskyPreCommit(options);

        expect(script).toEqual(expectedScript);
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

        const expectedScript =
          '#!/usr/bin/env sh\n. "$(dirname -- "$0")/_/husky.sh"' +
          `\n\n` +
          '# Following is for observability purposes\n\n' +
          '# TODOs / FIXMEs\n' +
          'printf "\n\n"\n' +
          'printf "TODOs / FIXMEs - consider reviewing these"\n' +
          'printf "\n------------------------------------------\n"\n\n' +
          "npx leasot 'src/**/*.[jt]s?(x)' --exit-nicely\n\n" +
          'printf "\n\n------------------------------------------\n\n"\n' +
          'printf "Now push your code! 🚀"\n' +
          'printf "\n\n------------------------------------------\n\n"';

        const script = makeHuskyPreCommit(options);

        expect(script).toEqual(expectedScript);
      });
    });
  });
});
