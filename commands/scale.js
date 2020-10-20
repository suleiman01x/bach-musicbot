const teoria = require('teoria');
const {capArray, capitalize, sendAndDelete} = require('../lib/musicFormatting');
const Fuse = require('fuse.js');
const usageText = require('./usage.json').scale;
const MidiWriter = require('midi-writer-js');


const scales = ['major', 'minor', 'ionian', 'dorian', 'phrygian', 'lydian', 'mixolydian', 'aeolian', 'locrian', 'pentatonic', 'chromatic', 'blues', 'harmonicminor', 'melodicminor', 'wholetone']
const fuseScales = new Fuse(scales, {includeScore: true});
const options = {
    mode: {
      name: '-mode',
      argNums: 1
    },
    midi: {
      name: '-midi',
      argNums: 0
    }
  }

function addNotes(track, teoriaNotes) {
  for (var note in teoriaNotes){ //converts teoria note to scientific. then adds note event to track
    var midiNote = teoriaNotes[note].scientific();
    track.addEvent(new MidiWriter.NoteEvent({
      pitch: midiNote,
      duration: '8'
      }))
  }
  return track;
}


module.exports = {
  name: 'scale',
  description: '音階の情報を表示する',
  execute(message, args){
    if (args.length === 0 || args.includes('-help')) { //sends usage message
      message.channel.send(usageText);
      return;
    }

    const key = args.shift();
    var note = key;
    var mode = 'major';

    // parses for a 'm' to make the chord scale minor
    if (key.endsWith('m')) {
      mode = 'minor';
      note = note.substring(0, note.length - 1)
    }

    // parses the options
    for (var optNum in options) {
      let optName = options[optNum]
      if (args.includes(optName.name)) {
        let indexNum = args.indexOf(optName.name);
        optName.enabled = true;
        //inserts arguments in to optName.args
        optName.args = args.splice(indexNum, optName.argNums + 1);
        optName.args.shift();
      }
    }

    //mode
    if (options['mode'].enabled) {
      const commandMode = fuseScales.search(options['mode'].args[0])[0].item;
      if (commandMode === 'pentatonic') { //super jank. changes major/minor pentatonic depending on if notes end in 'm'
        mode = mode + commandMode;
      } else {
        mode = commandMode;
      }
    }

    //defines key and scale mode etc.
    var scaleKeyNote = teoria.note('c');
    try { //makes note and catches errors
      scaleKeyNote = teoria.note(note);
    } catch (error) {
      console.log(error);
      return message.reply(`${note}は根音になれません`);
    }

    const scale = scaleKeyNote.scale(mode);
    const scaleNotes = scale.notes()
    const scaleName = `${note.toUpperCase()}_${capitalize(mode)}`;


    //midi
    if (options['midi'].enabled) {
      let track = new MidiWriter.Track();
      try {
        const writer = new MidiWriter.Writer(addNotes(track, scaleNotes))
        writer.saveMIDI(scaleName);
      } catch(error) {
        console.log('WTF HAPPENED TO SCALEEE');
        options['midi'].enabled = false;
      }
    }


    message.channel.send(`${scaleName}: ${capArray(scale.simple())}`);
    if (options['midi'].enabled) sendAndDelete(message, `${scaleName}.mid`);
  }
}
