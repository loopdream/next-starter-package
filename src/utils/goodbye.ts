import figlet from 'figlet';

function goodbye() {
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

export default goodbye;
