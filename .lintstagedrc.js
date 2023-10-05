export default {
  '**/*.[jt]s': (filenames) => [
    `prettier --check ${filenames.join(' ')}`,
    `prettier --write ${filenames.join(' ')}`,
    `eslint ${filenames.join(' ')}`,
    `eslint --fix ${filenames.join(' ')}`,
    `tsc --noEmit`,
  ],

  '**/*.(md, yml, yaml, json)': (filenames) => [
    `prettier --check ${filenames.join(' ')}`,
    `prettier --write ${filenames.join(' ')}`,
  ],
};