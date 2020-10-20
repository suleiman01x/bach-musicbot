const usageText = require('./usage.json').chord;
const teoria = require('teoria');
const {capArray, sendAndDelete} = require('../lib/musicFormatting');
const MidiWriter = require('midi-writer-js');

const options = {
  midi: {
    name: '-midi',
    argNums: 0
  }
}

function addChord(track, teoriaNotes) {
  track.addEvent(new MidiWriter.NoteEvent({
    pitch: teoriaNotes.map(x => x.scientific()),
    duration: '1'
  }))
  return track;
}

module.exports = {
  name: 'chord',
  description: 'コード名からそのコードの情報を表示する',
  execute(message, args) {
    if (args.length === 0 || args.includes('-help')) {
      return message.reply(usageText);
    }
    //parses for options
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

    try { //test for errors in making a chord object
      var chord = teoria.chord(args[0]);
    } catch (error) {
      return message.reply(`${args[0]}はコードと認識されません`);
    }

    // declare parsed chord
    const chordName = chord.name;
    const chordNotes = chord.notes()
    const chordNoteNames = chord.simple()

    if (options['midi'].enabled) { //write Midi
      let track = new MidiWriter.Track();
      try {
        const writer = new MidiWriter.Writer(addChord(track, chordNotes));
        writer.saveMIDI(chordName);
      } catch(error) {
        console.log('SOMETHING HAPPENED TO CHORD!!!')
        options['midi'].enabled = false;
      }
    }


    message.channel.send(`${chordName}の音: ${capArray(chordNoteNames)}`);
    //send Midi file
    if (options['midi'].enabled) sendAndDelete(message, `${chordName}.mid`);
  }
}
