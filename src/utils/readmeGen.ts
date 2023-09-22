import fs from 'fs';
import path from 'path';

import oops from './oops.js';

const readmeGen = (root: string) => {
  const markdownArr = [] as string[];

  const addMarkdown = async (filepath: string) => {
    if (fs.existsSync(filepath)) {
      try {
        const md = await fs.promises.readFile(filepath, 'utf8');
        markdownArr.push(md);
      } catch (error) {
        oops();
        throw new Error(`${error}`);
      }
    }
  };

  const generate = async () => {
    try {
      await fs.promises.writeFile(
        path.join(root, 'README.md'),
        markdownArr.join('\n\n')
      );
    } catch (error) {
      oops();
      throw new Error(`${error}`);
    }
  };

  return {
    addMarkdown,
    generate,
  };
};

export default readmeGen;
