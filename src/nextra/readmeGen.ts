import fs from 'fs';
import path from 'path';

import { oops } from '../utils.js';

export default class ReadmeGen {
  private root: string;
  private markdownArr: string[];

  constructor(root: string) {
    this.root = root;
    this.markdownArr = [];
  }

  public addMarkdown = async (filepath: string) => {
    if (fs.existsSync(filepath)) {
      try {
        const md = await fs.promises.readFile(filepath, 'utf8');
        this.markdownArr.push(md);
      } catch (error) {
        oops();
        throw new Error(`${error}`);
      }
    }
  };

  public generate = async () => {
    try {
      await fs.promises.writeFile(
        path.join(this.root, 'README.md'),
        this.markdownArr.join('\n\n')
      );
    } catch (error) {
      oops();
      throw new Error(`${error}`);
    }
  };
}
