const teoria = require('teoria');
const {capArray, capitalize} = require('../lib/musicFormatting');
const Fuse = require('fuse.js');
const usageText = require('./usage.json').scale;


const scales = ['major', 'minor', 'ionian', 'dorian', 'phrygian', 'lydian', 'mixolydian', 'aeolian', 'locrian', 'pentatonic', 'chromatic', 'blues', 'harmonicminor', 'melodicminor', 'wholetone']
const fuseScales = new Fuse(scales, {includeScore: true});

module.exports = {
  name: 'scale',
  description: '音階の情報を表示する',
  execute(message, args){
    if (args.length === 0 || args.includes('-help')) {
      message.channel.send(usageText);
      return;
    }

    const key = args.shift();
    var note = key;
    var mode = 'major';
    // Am becomes minor
    if (key.endsWith('m')) {
      mode = 'minor';
      note = note.substring(0, note.length - 1)
    }

    if (args.includes('-mode')) {
      const commandMode = fuseScales.search(args[args.indexOf('-mode') + 1])[0].item;
      if (commandMode === 'pentatonic') {
        mode = mode + commandMode;
      } else {
        mode = commandMode;
      }
    }
    var scaleKeyNote = teoria.note('c')
    try {
      scaleKeyNote = teoria.note(note);
    } catch (error) {
      console.log(error);
      return message.reply(`${note}は根音になれません`);
    }
    const scaleNotes = scaleKeyNote.scale(mode).simple();
    message.channel.send(`${note.toUpperCase()} ${capitalize(mode)}: ${capArray(scaleNotes)}`);
  }
}
