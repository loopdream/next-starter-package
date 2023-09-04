import { LOG_MESSAGES, COMMANDS } from './constants.js';
import process from 'process';

export const { log, error: errorLog } = console;

export async function nextJSInstall(projectDirectory: string) {
  
  log( `${LOG_MESSAGES.nextJs} ./${projectDirectory}\n\n`);

  try {
    const { execa } = await import("execa"); // Execa needs dynamic import
    const nextInstallCmd = COMMANDS.installNext.split(' ');

    // call the next install with projectDirectory, eslint, and app router as default
    await execa(nextInstallCmd[0], [nextInstallCmd[1], projectDirectory, '--eslint', '--app'], {
      stdio: 'inherit',
    });

    } catch (error: any) { 
      errorLog(`${LOG_MESSAGES.nextJsError} ${error}`);
      return false;
    }

    return true;
}


export async function setupEslintPrettier(projectDirectory: string) {

  try {
    const { $ , execa } = await import("execa");
    process.chdir(`./${projectDirectory}`); // cd into next project directory
 

    log(`\n2.1 Installing @typescript-eslint/eslint-plugin prettier eslint-config-prettier...\n\n`)
    
    await execa(`npm`, [`i`, `-D`, `@typescript-eslint/eslint-plugin`, `prettier`, `eslint-config-prettier`], {
      stdio: 'inherit',
    });

    log(`\ndone\n\n`, `\n2.2 Configuring eslintrc...\n\n`);


    log(`\ndone\n\n`);

  } catch (error) {
    errorLog(`${LOG_MESSAGES.esLintPrettierError} ${error}`);
    return false;
  }

}

export async function setupHusky(projectDirectory: string) {
  
}
