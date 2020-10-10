const teoria = require('teoria');
const {capArray, capitalize} = require('../lib/musicFormatting');
const Fuse = require('fuse.js');
const usageText = require('./usage.json').scale;
const MidiWriter = require('midi-writer-js');
const fs = require('fs');


const scales = ['major', 'minor', 'ionian', 'dorian', 'phrygian', 'lydian', 'mixolydian', 'aeolian', 'locrian', 'pentatonic', 'chromatic', 'blues', 'harmonicminor', 'melodicminor', 'wholetone']
const fuseScales = new Fuse(scales, {includeScore: true});

function makeMidiTrack(teoriaNotes) {
  var track = new MidiWriter.Track();
  for (var note in teoriaNotes){ //converts teoria note to scientific. then adds note event to track
    var midiNote = teoriaNotes[note].scientific();
    console.log(midiNote);
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

    //mode option
    if (args.includes('-mode')) {
      const commandMode = fuseScales.search(args[args.indexOf('-mode') + 1])[0].item;
      if (commandMode === 'pentatonic') { //super jank. changes major/minor pentatonic depending on the notes ending in 'm'
        mode = mode + commandMode;
      } else {
        mode = commandMode;
      }
    }

    //defines 
    var scaleKeyNote = teoria.note('c');
    try { //makes note and catches errors
      scaleKeyNote = teoria.note(note);
    } catch (error) {
      console.log(error);
      return message.reply(`${note}は根音になれません`);
    }
    const scaleNotes = scaleKeyNote.scale(mode);
    const scaleName = `${note.toUpperCase()}_${capitalize(mode)}`;

    //midi option
    if (args.includes('-midi')) {
      var scaleMidi = makeMidiTrack(scaleNotes.notes());
      var writer = new MidiWriter.Writer(scaleMidi)
      writer.saveMIDI(scaleName);
      var hasMidi = true;
    }


    message.channel.send(`${scaleName}: ${capArray(scaleNotes.simple())}`);
    if (hasMidi) {message.channel.send({
      files: [{
        attachment: `./${scaleName}.mid`,
        name: `${scaleName}.mid`
        }]
      })
      .then(() => {
        fs.unlink(`${scaleName}.mid`, (err) => {
          if(err) console.log(err)
        });
      });
    }
  }
}
