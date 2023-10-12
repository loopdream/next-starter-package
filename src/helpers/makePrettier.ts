function makePrettierrc() {
  const prettierrc = {
    plugins: ['@trivago/prettier-plugin-sort-imports'],
    importOrderSeparation: true,
    importOrder: ['^[./]'],
    trailingComma: 'es5',
    tabWidth: 2,
    semi: true,
    singleQuote: true,
  };

  return prettierrc;
}

function makePrettierignore() {
  const prettierrc = [
    '.next',
    '.cache',
    'package-lock.json',
    'public',
    'node_modules',
    'next-env.d.ts',
    'next.config.ts',
    'yarn.lock',
  ];

  return prettierrc.join('\n') as string;
}

export default { makePrettierrc, makePrettierignore };
