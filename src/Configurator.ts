import { $ } from 'execa';
import figlet from 'figlet';
import fs from 'fs';
import { markdownTable } from 'markdown-table';
import ora, { Options as OraOptions } from 'ora';
//, { Options as OraOptions }
import path from 'path';
import picocolors from 'picocolors';
import prompts from 'prompts';

import PackageManager, { PackageManagerKindEnum } from './PackageManager.js';
import makeEslintrc from './helpers/makeEslintrc.js';
import makeHuskyPreCommit from './helpers/makeHuskyPreCommit.js';
import makeLintStagedrc from './helpers/makeLintStagedrc.js';
import { makePrettierignore, makePrettierrc } from './helpers/makePrettier.js';
import prepareConfig from './helpers/prepareConfig.js';
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
  private srcPath: string;

  constructor({
    projectDirectoryPath,
    packageManagerChoice: packageManagerKind,
  }: ConfiguratorPropsType) {
    this.cwd = path.resolve(projectDirectoryPath);
    this.srcPath = path.resolve(path.join('src'));
    this.options.packageManager = packageManagerKind;
    this.packageManager = new PackageManager({
      packageManagerKind,
      cwd: this.cwd,
    });
  }

  awaitTimeout = (delay: number) =>
    new Promise((resolve) => setTimeout(resolve, delay));

  private withSpinner = async (
    fn: () => Promise<void>,
    text: string,
    opts?: OraOptions,
    delay: number = 1000
  ) => {
    const spinner = ora(opts).start(text);

    await fn()
      .then(() => this.awaitTimeout(delay))
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

    setOptions(options)
      .then(() => prepare())
      .then(() => {
        console.log(
          [
            bold(`Using ` + packageManager.getKind()),
            `The configurator will now setup your next project based on your selections.`,
          ].join(`\n\n`)
        );
      })
      .then(() => installDependencies())
      .then(() => withSpinner(buildConfigs, 'Building configuration files'))
      .then(() => withSpinner(configurePackageFile, 'Configuring package file'))
      .then(() => withSpinner(generateReadme, 'Generating Readme'))
      .then(() => withSpinner(cleanUp, 'Cleaning up'))
      .then(() =>
        console.log(
          `\n`,
          green('Success! '),
          `The following configurations were made: <TODO: ADD MORE INFO>`
        )
      )
      .catch((error) => {
        console.log(`\n`, figlet.textSync('Ooops...'), `\n\n`);
        throw new Error(`${error}`);
      });
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

  public buildConfigs = async () => {
    await this.configureDotEnvFiles();
    await this.configurePrettier();
    await this.configureEslint();
    await this.copyTemplateConfigs();
  };

  public setOptions = (answers: OptionsType | prompts.Answers<string>) => {
    return new Promise((resolve) => {
      this.options = {
        ...this.options,
        ...answers,
      };
      resolve(this.options);
    });
  };

  public createNextApp = async () => {
    const { cwd, packageManager } = this;
    const pm = packageManager.getKind();

    await $({
      stdio: 'inherit',
    })`npx create-next-app@latest ${cwd} --use-${pm}`.catch((error) => {
      console.log(
        `\n\n`,
        red(bold('Error!')),
        `Please check that your chosen package manager ${cyan(
          bold(pm)
        )} is installed:`,
        cyan(
          pm === PackageManagerKindEnum.PNPM
            ? 'https://pnpm.io/installation'
            : pm === PackageManagerKindEnum.YARN
            ? 'https://yarnpkg.com/getting-started/install'
            : 'https://bun.sh/docs/installation'
        ),
        `\n\n`
      );
      throw new Error(`\n${error}`);
    });

    this.options = {
      ...this.options,
      ...this.getNextConfig(),
    };

    return this.options;
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

  public installConfigureGitHusky = async () => {
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

  public installDependencies = async () => {
    const { packageDependencies, packageDevDependencies } = this.config;

    if (packageDependencies.length > 0) {
      const dependencies = packageDependencies
        .map((dep) => `- ` + cyan(dep))
        .sort()
        .join(`\n`);

      console.log(`\nInstalling dependencies:\n${dependencies}\n`);
      await this.packageManager.addToDependencies(packageDependencies);
    }

    if (packageDevDependencies.length > 0) {
      const devDependencies = this.config.packageDevDependencies
        .map((dep) => `- ` + cyan(dep))
        .sort()
        .join(`\n`);

      console.log(`\nInstalling devDependencies:\n${devDependencies}\n`);
      await this.packageManager.addToDevDependencies(packageDevDependencies);
    }

    if (this.options.husky) {
      await this.installConfigureGitHusky();
    }
  };

  public configurePackageFile = async () => {
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

    const configs: Promise<void[] | undefined>[] = [];

    if (configTemplateDirectories.length > 0) {
      configs.push(this.copyTemplate(configTemplateDirectories, true));
    }

    if (configTemplateFiles.length > 0) {
      configs.push(this.copyTemplate(configTemplateFiles));
    }

    if (configs.length === 0) return;

    return Promise.all(configs).catch((error) => {
      throw new Error(`${error}`);
    });
  };

  public cleanUp = async () => {
    // clean up ie format files - maybe other stuff TBC
    const { packageManager, options, cwd } = this;
    if (options.prettier) {
      await $({ cwd })`${packageManager.getKind()} run format:write`.catch(
        (error) => {
          console.log(`${error}`);
        }
      );
    }
  };

  private readFromFiles = async (filenames: string[]) => {
    const filePaths = filenames.map((filename) =>
      path.join(this.srcPath, 'markdown', filename)
    );

    const readFiles = filePaths.map((filePath) =>
      fs.readFileSync(filePath, 'utf8')
    );

    const markdownArr = await Promise.all(readFiles).catch((error) => {
      throw new Error(`${error}`);
    });

    return markdownArr;
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

  public generateReadme = async () => {
    return this.readFromFiles(this.config.markdown)
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

  private copyTemplate = async (
    template: string[],
    recursive: boolean = false
  ) => {
    if (!Array.isArray(template) || template.length === 0) return;

    const copyFiles = template.map((file) =>
      fs.promises.cp(
        path.join(this.srcPath, 'templates', file),
        path.join(this.cwd, file),
        { recursive }
      )
    );

    return await Promise.all(copyFiles).catch((error) => {
      throw new Error(`${error}`);
    });
  };
}

export default Configurator;
