const usageText = require('./usage.json').chord;
const teoria = require('teoria');
const {capArray} = require('../lib/musicFormatting');

module.exports = {
  name: 'chord',
  description: 'コード名からそのコードの情報を表示する',
  execute(message, args) {
    if (args.length === 0 || args.includes('-help')) {
      return message.reply(usageText);
    }

    try { //test for errors in making a chord object
      var chord = teoria.chord(args[0]);
    } catch (error) {
      return message.reply(`${args[0]}はコードと認識されません`);
    }
    
    const chordName = chord.name;
    const chordNotes = chord.simple()

    message.channel.send(`${chordName}の音: ${capArray(chordNotes)}`);
  }
};
