const getRandomGoodbye = () => {
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

  return randomGoodbye;
};

export default getRandomGoodbye;
