import { $ } from 'execa';
import figlet from 'figlet';
import fs from 'fs';
import { markdownTable } from 'markdown-table';
import ora, { Options as OraOptions } from 'ora';
import path from 'path';
import picocolors from 'picocolors';
import prompts from 'prompts';

import PackageManager, { PackageManagerKindEnum } from './PackageManager.js';
import makeEslintrc from './helpers/makeEslintrc.js';
import makeHuskyPreCommit from './helpers/makeHuskyPreCommit.js';
import makeLintStagedrc from './helpers/makeLintStagedrc.js';
import { makePrettierignore, makePrettierrc } from './helpers/makePrettier.js';
import prepareConfig from './helpers/prepareConfig.js';
import sleep from './helpers/sleep.js';
import { ChoiceValuesType } from './prompts.js';

type ConfiguratorPropsType = {
  packageManagerChoice: PackageManagerKindEnum;
  projectDirectoryPath: string;
};

export interface ConfigType {
  configTemplateDirectories: string[];
  configTemplateFiles: string[];
  markdown: string[];
  packageDependencies: string[];
  packageDevDependencies: string[];
  packageScripts: Record<string, string>;
}

export interface OptionsType {
  appRouter: boolean;
  cypress: boolean;
  docker: boolean;
  dotEnvFiles: string[];
  eslint: boolean;
  husky: boolean;
  jest: boolean;
  lintStaged: boolean;
  imageOptimisation: boolean;
  optionalDependencies: ChoiceValuesType[];
  packageManager: PackageManagerKindEnum;
  prettier: boolean;
  reactTestingLibrary: boolean;
  selectedDependencies: boolean;
  srcDir: boolean;
  storybook: boolean;
  tailwind: boolean;
  typescript: boolean;
  markdown: string[];
}

const { red, cyan, green, bold } = picocolors;

class Configurator {
  private config = {} as ConfigType;
  private cwd: string;
  private options = {
    appRouter: false,
    cypress: false,
    docker: false,
    dotEnvFiles: [],
    eslint: false,
    husky: false,
    jest: false,
    lintStaged: false,
    imageOptimisation: false,
    optionalDependencies: [],
    packageManager: PackageManagerKindEnum.NPM,
    prettier: false,
    reactTestingLibrary: false,
    selectedDependencies: false,
    srcDir: false,
    storybook: false,
    tailwind: false,
    typescript: false,
    markdown: [],
  } as OptionsType;
  private packageManager = {} as PackageManager;
  private templatesPath: string;

  constructor({
    projectDirectoryPath,
    packageManagerChoice: packageManagerKind,
  }: ConfiguratorPropsType) {
    this.cwd = path.resolve(projectDirectoryPath);
    this.templatesPath = path.resolve(path.join('src', 'templates'));
    this.options.packageManager = packageManagerKind;
    this.packageManager = new PackageManager({
      packageManagerKind,
      cwd: this.cwd,
    });
  }

  private withSpinner = async (
    fn: () => Promise<void | unknown>,
    text: string,
    opts: OraOptions = {},
    delay: number = 1000
  ) => {
    const spinner = ora(opts).start(text);

    await fn()
      .then(() => sleep(delay))
      .then(() => spinner.succeed())
      .catch(() => spinner.fail());
  };

  public run = async (options: prompts.Answers<string>) => {
    const {
      buildConfigs,
      cleanUp,
      configurePackageFile,
      generateReadme,
      installDependencies,
      packageManager,
      prepare,
      setOptions,
      withSpinner,
    } = this;

    console.log(
      [
        bold(`Using ` + packageManager.getKind()),
        `The configurator will now setup your next project based on your selections.`,
      ].join(`\n\n`)
    );

    await setOptions(options)
      .then(() => withSpinner(prepare, 'Preparing installation'))
      .then(() => installDependencies())
      .then(() => withSpinner(buildConfigs, 'Building configuration files'))
      .then(() => withSpinner(configurePackageFile, 'Configuring package file'))
      .then(() => withSpinner(generateReadme, 'Generating Readme'))
      .then(() => withSpinner(cleanUp, 'Cleaning up'))
      .catch((error) => {
        console.log(`\n` + figlet.textSync('Ooops...') + `\n\n`);
        throw new Error(`${error}`);
      });

    console.log(
      `\n` + green('Success! '),
      `The following configurations were made: <TODO: ADD MORE INFO>`
    );
  };

  public prepare = () => {
    return new Promise((resolve) => {
      this.config = {
        ...this.config,
        ...prepareConfig(this.options),
      };
      resolve(this.config);
    });
  };

  public setOptions = (options: OptionsType | prompts.Answers<string>) => {
    return new Promise((resolve) => {
      this.options = {
        ...this.options,
        ...options,
      };
      resolve(this.options);
    });
  };

  public buildConfigs = async () => {
    const configurations = [
      ...(this.options.dotEnvFiles.length > 0
        ? [this.configureDotEnvFiles()]
        : []),
      ...(this.options.prettier ? [this.configurePrettier()] : []),
      ...(this.options.eslint ? [this.configureEslint()] : []),
      ...(this.options.husky ? [this.configureGitHusky()] : []),
      this.copyTemplateConfigs(),
    ];

    return Promise.all(configurations).catch((error) => {
      throw new Error(`${error}`);
    });
  };

  public createNextApp = async () => {
    const { cwd, packageManager } = this;
    const pm = packageManager.getKind();

    if (pm !== PackageManagerKindEnum.NPM) {
      await $`${pm} -v`.catch((error) => {
        console.log(
          `\n\n` + red(bold('Error!')),
          `Please check that your chosen package manager ${cyan(
            bold(pm)
          )} is installed:`,
          cyan(
            pm === PackageManagerKindEnum.PNPM
              ? 'https://pnpm.io/installation'
              : pm === PackageManagerKindEnum.YARN
              ? 'https://yarnpkg.com/getting-started/install'
              : 'https://bun.sh/docs/installation'
          ) + `\n\n`
        );
        throw new Error(`\n${error}`);
      });
    }

    await $({
      stdio: 'inherit',
    })`npx create-next-app@latest ${cwd} --use-${pm}`.catch((error) => {
      throw new Error(`\n${error}`);
    });

    return this.setOptions({
      ...this.options,
      ...this.getNextConfig(),
    });
  };

  public getConfig = () => {
    return this.config;
  };

  public getNextConfig = () => {
    const exists = (fileName: string) =>
      fs.existsSync(path.join(this.cwd, fileName));

    const typescript = exists('tsconfig.json');

    return {
      appRouter: !exists('src/pages'),
      eslint: exists('.eslintrc.json'),
      tailwind: exists(`tailwind.config.${typescript ? 'ts' : 'js'}`),
      srcDir: exists('src'),
      typescript,
    };
  };

  private configureGitHusky = async () => {
    const $execa = $({ cwd: this.cwd });
    const { packageManager, options, cwd } = this;
    const pm = packageManager.getKind();

    const huskyPreCommit = makeHuskyPreCommit(options);
    const preCommitPath = path.join(cwd, '.husky', 'pre-commit');

    return $execa`git init`
      .then(() => $execa`${pm} husky install`)
      .then(() => fs.promises.writeFile(preCommitPath, huskyPreCommit))
      .catch((error) => {
        throw new Error(`${error}`);
      });
  };

  private installDependencies = async () => {
    const { packageDependencies, packageDevDependencies } = this.config;

    if (packageDependencies.length > 0) {
      const dependenciesList = packageDependencies
        .map((dep) => `- ` + cyan(dep))
        .sort()
        .join(`\n`);

      console.log(`\nInstalling dependencies:\n${dependenciesList}\n`);
      await this.packageManager.addToDependencies(packageDependencies);
    }

    if (packageDevDependencies.length > 0) {
      const devDependenciesList = this.config.packageDevDependencies
        .map((dep) => `- ` + cyan(dep))
        .sort()
        .join(`\n`);

      console.log(`\nInstalling devDependencies:\n${devDependenciesList}\n`);
      await this.packageManager.addToDevDependencies(packageDevDependencies);
    }
  };

  private configurePackageFile = async () => {
    await this.packageManager.addToPackage(
      'scripts',
      this.config.packageScripts
    );

    if (this.options.lintStaged) {
      const lintstagedrc = makeLintStagedrc(this.options);
      await this.packageManager.addToPackage('lint-staged', lintstagedrc);
    }
  };

  private configurePrettier = async () => {
    if (!this.options.prettier) return;

    const prettierrc = makePrettierrc();
    const prettierignore = makePrettierignore();

    const prettierFiles = [
      fs.promises.writeFile(
        path.join(this.cwd, '.prettierrc.json'),
        JSON.stringify(prettierrc)
      ),
      fs.promises.writeFile(
        path.join(this.cwd, '.prettierignore'),
        prettierignore
      ),
    ];

    return Promise.all(prettierFiles).catch((error) => {
      throw new Error(`${error}`);
    });
  };

  private configureEslint = async () => {
    if (!this.options.eslint) return;

    const eslintrc = makeEslintrc(this.options);

    return fs.promises
      .writeFile(
        path.join(this.cwd, '.eslintrc.json'),
        JSON.stringify(eslintrc)
      )
      .catch((error) => {
        throw new Error(`${error}`);
      });
  };

  private configureDotEnvFiles = async () => {
    if (this.options.dotEnvFiles.length === 0) return;

    const copyEnvFiles = this.options.dotEnvFiles.map(
      (file: string) => $`touch ${path.join(this.cwd, file)}`
    );

    return Promise.all(copyEnvFiles).catch((error) => {
      throw new Error(`${error}`);
    });
  };

  private copyTemplateConfigs = async () => {
    const { configTemplateDirectories, configTemplateFiles } = this.config;

    const copy = (paths: string[], recursive: boolean = false) => {
      return paths.map((file) =>
        fs.promises.cp(
          path.join(this.templatesPath, file),
          path.join(this.cwd, file),
          { recursive }
        )
      );
    };

    const copyTemplates = [
      ...(configTemplateDirectories.length > 0
        ? copy(configTemplateDirectories, true)
        : []),
      ...(configTemplateFiles.length > 0 ? copy(configTemplateFiles) : []),
    ];

    return Promise.all(copyTemplates).catch((error) => {
      throw new Error(`${error}`);
    });
  };

  private cleanUp = async () => {
    // clean up ie format files - maybe other stuff TBC
    const { packageManager, options, cwd } = this;

    if (options.prettier) {
      return $({ cwd })`${packageManager.getKind()} run format:write`.catch(
        (error) => {
          throw new Error(`${error}`);
        }
      );
    }

    return;
  };

  private makeDependenciesMarkdownTable() {
    const tableHeader = ['Package name', 'Package description', 'Type'];
    const tableData = this.options.optionalDependencies.map(
      ({ module, github, description, saveDev }) => [
        `[${module}](${github})`,
        description,
        saveDev ? '`devDependency`' : '`dependency`',
      ]
    );

    return markdownTable([tableHeader, ...tableData]);
  }

  private generateReadme = async () => {
    const readFiles = this.config.markdown.map((file) =>
      fs.readFileSync(path.join(this.templatesPath, 'markdown', file), 'utf8')
    );

    return Promise.all(readFiles)
      .then((markdownStrArr) => {
        if (this.options.optionalDependencies.length > 0) {
          markdownStrArr.push(this.makeDependenciesMarkdownTable());
        }
        return markdownStrArr.join('\n\n');
      })
      .then((markdown) =>
        fs.promises.writeFile(path.join(this.cwd, 'README.md'), markdown)
      )
      .catch((error) => {
        throw new Error(`${error}`);
      });
  };
}

export default Configurator;
