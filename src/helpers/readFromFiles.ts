import fs from 'fs';

const readFromFiles = async (filePaths: string[]) => {
  const readFiles = filePaths.map((filePath) =>
    fs.readFileSync(filePath, 'utf8')
  );

  return await Promise.all(readFiles).catch((error) => {
    throw new Error(`${error}`);
  });
};

export default readFromFiles;
