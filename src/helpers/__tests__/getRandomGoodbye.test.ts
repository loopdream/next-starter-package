import getRandomGoodbye from '../getRandomGoodbye.js';

describe('getRandomGoodbye', () => {
  it('should return a random goodbye message', () => {
    const goodbyeArr = [
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

    const goodbye = getRandomGoodbye();

    expect(goodbyeArr).toContain(goodbye);
  });
});
