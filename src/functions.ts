import figlet from 'figlet';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const onPromptState = (state: any) => {
  if (state.aborted) {
    // If we don't re-enable the terminal cursor before exiting
    // the program, the cursor will remain hidden
    process.stdout.write('\x1B[?25h');
    process.stdout.write('\n');
    process.exit(1);
  }
};

export function goodbye() {
  const goodbyes = [
    'Adios',
    'Aloha',
    'Arrivederci',
    'Au Revoir',
    'Auf Wiedersehen',
    'Ciao',
    'Good bye',
    'Namaste',
    'Sayōnara',
    'Zài jiàn',
  ];
  const randomGoodbye = goodbyes[Math.floor(Math.random() * goodbyes.length)];
  return console.log(`\n`, figlet.textSync(randomGoodbye), '\n\n');
}
