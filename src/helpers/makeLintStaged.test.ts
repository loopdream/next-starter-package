import { PackageManagerKindEnum } from '../PackageManager.js';
import makeLintStaged from './makeLintStaged.js';

describe('makeLintStaged.config', () => {
  it('should return a valid lint-staged configuration object', () => {
    //test
    const expectedConfig = {
      '**/*.js?(x)': [
        'prettier --check .',
        'prettier --write .',
        'eslint .',
        'eslint --fix .',
        'jest --ci',
      ],
      '**/*.ts?(x)': [
        'prettier --check .',
        'prettier --write .',
        'eslint .',
        'eslint --fix .',
        'jest --ci',
        'tsc --noEmit',
      ],
      '**/*.{md, yml, yaml, json}': [
        'prettier --check .',
        'prettier --write .',
      ],
      '**/*.{css}': ['prettier --check .', 'prettier --write .'],
    };

    const config = makeLintStaged.config({
      eslint: true,
      jest: true,
      prettier: true,
      typescript: true,
    });

    expect(config).toEqual(expectedConfig);
  });

  it('should return a valid lint-staged configuration object without TypeScript', () => {
    const expectedConfig = {
      '**/*.js?(x)': [
        'prettier --check .',
        'prettier --write .',
        'eslint .',
        'eslint --fix .',
        'jest --ci',
      ],
      '**/*.{md, yml, yaml, json}': [
        'prettier --check .',
        'prettier --write .',
      ],
      '**/*.{css}': ['prettier --check .', 'prettier --write .'],
    };

    const config = makeLintStaged.config({
      eslint: true,
      jest: true,
      prettier: true,
      typescript: false,
    });

    expect(config).toEqual(expectedConfig);
  });

  it('should return a valid lint-staged configuration object without Jest', () => {
    const expectedConfig = {
      '**/*.js?(x)': [
        'prettier --check .',
        'prettier --write .',
        'eslint .',
        'eslint --fix .',
      ],
      '**/*.ts?(x)': [
        'prettier --check .',
        'prettier --write .',
        'eslint .',
        'eslint --fix .',
        'tsc --noEmit',
      ],
      '**/*.{md, yml, yaml, json}': [
        'prettier --check .',
        'prettier --write .',
      ],
      '**/*.{css}': ['prettier --check .', 'prettier --write .'],
    };

    const config = makeLintStaged.config({
      eslint: true,
      jest: false,
      prettier: true,
      typescript: true,
    });

    expect(config).toEqual(expectedConfig);
  });

  it('should return a valid lint-staged configuration object without Prettier', () => {
    const expectedConfig = {
      '**/*.js?(x)': ['eslint .', 'eslint --fix .', 'jest --ci'],
      '**/*.ts?(x)': [
        'eslint .',
        'eslint --fix .',
        'jest --ci',
        'tsc --noEmit',
      ],
    };

    const config = makeLintStaged.config({
      eslint: true,
      jest: true,
      prettier: false,
      typescript: true,
    });

    expect(config).toEqual(expectedConfig);
  });

  it('should return a valid lint-staged configuration object without ESLint', () => {
    const options = {
      eslint: false,
      jest: true,
      prettier: true,
      typescript: true,
    };
    const expectedConfig = {
      '**/*.js?(x)': ['prettier --check .', 'prettier --write .', 'jest --ci'],
      '**/*.ts?(x)': [
        'prettier --check .',
        'prettier --write .',
        'jest --ci',
        'tsc --noEmit',
      ],
      '**/*.{md, yml, yaml, json}': [
        'prettier --check .',
        'prettier --write .',
      ],
      '**/*.{css}': ['prettier --check .', 'prettier --write .'],
    };

    const config = makeLintStaged.config(options);

    expect(config).toEqual(expectedConfig);
  });
});

describe('makeLintStaged.preCommit', () => {
  describe('when lint-staged is enabled', () => {
    it('should return a valid pre-commit hook script', () => {
      // Arrange
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
        'printf "\n------------------------------------------\n"\n#\n' +
        "npx leasot 'src/**/*.[jt]s?(x)' --exit-nicely\n\n" +
        'printf "\n\n------------------------------------------\n\n"\n' +
        'printf "Now push your code! 🚀"\n' +
        'printf "\n\n------------------------------------------\n\n"';
      // Act
      const script = makeLintStaged.preCommit(options);
      // Assert
      expect(script).toEqual(expectedScript);
    });
  });

  describe('when lint-staged is disabled', () => {
    describe('When the package manager is Yarn', () => {
      it('should use yarn', () => {
        const options = {
          eslint: true,
          jest: true,
          lintStaged: false,
          packageManager: PackageManagerKindEnum.YARN,
          prettier: true,
          typescript: true,
        };

        const script = makeLintStaged.preCommit(options);

        expect(script).toContain('yarn run lint:check');
        expect(script).toContain('yarn run lint:fix');
        expect(script).toContain('yarn run format:check');
        expect(script).toContain('yarn run format:write');
        expect(script).toContain('yarn run test --passWithNoTests');
        expect(script).toContain('yarn run build --no-emit');
      });
    });

    describe('When the package manager is Npm', () => {
      it('should use Npm', () => {
        const options = {
          eslint: true,
          jest: true,
          lintStaged: false,
          packageManager: PackageManagerKindEnum.NPM,
          prettier: true,
          typescript: true,
        };

        const script = makeLintStaged.preCommit(options);

        expect(script).toContain('npm run lint:check');
        expect(script).toContain('npm run lint:fix');
        expect(script).toContain('npm run format:check');
        expect(script).toContain('npm run format:write');
        expect(script).toContain('npm run test --passWithNoTests');
        expect(script).toContain('npm run build --no-emit');
      });
    });

    describe('When the package manager is Bun', () => {
      it('should use Bun', () => {
        const options = {
          eslint: true,
          jest: true,
          lintStaged: false,
          packageManager: PackageManagerKindEnum.BUN,
          prettier: true,
          typescript: true,
        };

        const script = makeLintStaged.preCommit(options);

        expect(script).toContain('bun run lint:check');
        expect(script).toContain('bun run lint:fix');
        expect(script).toContain('bun run format:check');
        expect(script).toContain('bun run format:write');
        expect(script).toContain('bun run test --passWithNoTests');
        expect(script).toContain('bun run build --no-emit');
      });
    });

    describe('When the package manager is Pnpm', () => {
      it('should use Pnpm', () => {
        const options = {
          eslint: true,
          jest: true,
          lintStaged: false,
          packageManager: PackageManagerKindEnum.PNPM,
          prettier: true,
          typescript: true,
        };

        const script = makeLintStaged.preCommit(options);

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
        // Arrange
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
          'printf "\n------------------------------------------\n"\n#\n' +
          "npx leasot 'src/**/*.[jt]s?(x)' --exit-nicely\n\n" +
          'printf "\n\n------------------------------------------\n\n"\n' +
          'printf "Now push your code! 🚀"\n' +
          'printf "\n\n------------------------------------------\n\n"';
        // Act
        const script = makeLintStaged.preCommit(options);
        // Assert
        expect(script).toEqual(expectedScript);
      });
    });

    describe('when prettier, eslint, jest, are enabled', () => {
      it('should return a valid pre-commit hook script', () => {
        // Arrange
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
          'printf "\n------------------------------------------\n"\n#\n' +
          "npx leasot 'src/**/*.[jt]s?(x)' --exit-nicely\n\n" +
          'printf "\n\n------------------------------------------\n\n"\n' +
          'printf "Now push your code! 🚀"\n' +
          'printf "\n\n------------------------------------------\n\n"';
        // Act
        const script = makeLintStaged.preCommit(options);
        // Assert
        expect(script).toEqual(expectedScript);
      });
    });

    describe('when prettier, eslint, typescript, are enabled', () => {
      it('should return a valid pre-commit hook script', () => {
        // Arrange
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
          'printf "\n------------------------------------------\n"\n#\n' +
          "npx leasot 'src/**/*.[jt]s?(x)' --exit-nicely\n\n" +
          'printf "\n\n------------------------------------------\n\n"\n' +
          'printf "Now push your code! 🚀"\n' +
          'printf "\n\n------------------------------------------\n\n"';
        // Act
        const script = makeLintStaged.preCommit(options);
        // Assert
        expect(script).toEqual(expectedScript);
      });
    });

    describe('when prettier, eslint, are enabled', () => {
      it('should return a valid pre-commit hook script', () => {
        // Arrange
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
          'printf "\n------------------------------------------\n"\n#\n' +
          "npx leasot 'src/**/*.[jt]s?(x)' --exit-nicely\n\n" +
          'printf "\n\n------------------------------------------\n\n"\n' +
          'printf "Now push your code! 🚀"\n' +
          'printf "\n\n------------------------------------------\n\n"';
        // Act
        const script = makeLintStaged.preCommit(options);
        // Assert
        expect(script).toEqual(expectedScript);
      });
    });

    describe('when only prettier is enabled', () => {
      it('should return a valid pre-commit hook script', () => {
        // Arrange
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
          'printf "\n------------------------------------------\n"\n#\n' +
          "npx leasot 'src/**/*.[jt]s?(x)' --exit-nicely\n\n" +
          'printf "\n\n------------------------------------------\n\n"\n' +
          'printf "Now push your code! 🚀"\n' +
          'printf "\n\n------------------------------------------\n\n"';
        // Act
        const script = makeLintStaged.preCommit(options);
        // Assert
        expect(script).toEqual(expectedScript);
      });
    });
    describe('when only eslint is enabled', () => {
      it('should return a valid pre-commit hook script', () => {
        // Arrange
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
          'printf "\n------------------------------------------\n"\n#\n' +
          "npx leasot 'src/**/*.[jt]s?(x)' --exit-nicely\n\n" +
          'printf "\n\n------------------------------------------\n\n"\n' +
          'printf "Now push your code! 🚀"\n' +
          'printf "\n\n------------------------------------------\n\n"';
        // Act
        const script = makeLintStaged.preCommit(options);
        // Assert
        expect(script).toEqual(expectedScript);
      });
    });

    describe('when only typescript is enabled', () => {
      it('should return a valid pre-commit hook script', () => {
        // Arrange
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
          'printf "\n------------------------------------------\n"\n#\n' +
          "npx leasot 'src/**/*.[jt]s?(x)' --exit-nicely\n\n" +
          'printf "\n\n------------------------------------------\n\n"\n' +
          'printf "Now push your code! 🚀"\n' +
          'printf "\n\n------------------------------------------\n\n"';
        // Act
        const script = makeLintStaged.preCommit(options);
        // Assert
        expect(script).toEqual(expectedScript);
      });
    });

    describe('when only some checks are enabled', () => {
      it('should return a valid pre-commit hook script', () => {
        // Arrange
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
          'printf "\n------------------------------------------\n"\n#\n' +
          "npx leasot 'src/**/*.[jt]s?(x)' --exit-nicely\n\n" +
          'printf "\n\n------------------------------------------\n\n"\n' +
          'printf "Now push your code! 🚀"\n' +
          'printf "\n\n------------------------------------------\n\n"';
        // Act
        const script = makeLintStaged.preCommit(options);
        // Assert
        expect(script).toEqual(expectedScript);
      });
    });

    describe('when all checks are disabled', () => {
      it('should return a valid pre-commit hook script', () => {
        // Arrange
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
          'printf "\n------------------------------------------\n"\n#\n' +
          "npx leasot 'src/**/*.[jt]s?(x)' --exit-nicely\n\n" +
          'printf "\n\n------------------------------------------\n\n"\n' +
          'printf "Now push your code! 🚀"\n' +
          'printf "\n\n------------------------------------------\n\n"';
        // Act
        const script = makeLintStaged.preCommit(options);

        // Assert
        expect(script).toEqual(expectedScript);
      });
    });
  });
});
