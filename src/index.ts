import { program } from "commander"
import figlet from 'figlet'
 
import { PROGRAM_DESCRIPTION, SCRIPT_DESCRIPTION, LOG_MESSAGES } from './constants.js'

import { nextJSInstall, setupEslintPrettier, setupHusky} from "./functions.js";


const { log, error: errorLog } = console;

log(figlet.textSync("QuantSpark"), '\n\n');


program
  .name('qsbaseline')
  .description(PROGRAM_DESCRIPTION)
  .version('1.0.0')
  .command('generate')
  .argument('<projectDirectory>', 'Project directory')
  .action(async (projectDirectory) => {
    
    log(SCRIPT_DESCRIPTION);

    let next, eslintPrettier, husky;
    
    // next = await nextJSInstall(projectDirectory);

    // if (next) 
    eslintPrettier = await setupEslintPrettier(projectDirectory);

    // if (eslintPrettier) husky = setupHusky(projectDirectory);

  });

program.parse();