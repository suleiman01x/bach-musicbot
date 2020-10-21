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

function chordMessage(chordArray, chordNotes) {
  var message = ''
  for (let chord in chordArray) {
    message += `${chordArray[chord]}の音：${capArray(chordNotes[chord])}\n`
  }
  return message
}

function addChord(track, noteArray) {
  let noteEvents = new Array()
  for(let noteGroup in noteArray) {
    noteEvents.push(new MidiWriter.NoteEvent({
      pitch: noteArray[noteGroup],
      duration: '1'
    }));
  }
  track.addEvent(noteEvents);
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
    console.log(args)
    var chords = new Array();
    for (var userChord in args) {
      try { //test for errors in making a chord object
        chords.push(teoria.chord(args[userChord]));
      } catch (error) {
        return message.reply(`${args[userChord]}はコードと認識されません`);
      }
    }

    // declare parsed chord             
    const chordNames = chords.map(chord => chord.name)
    const chordNotes = chords.map(chord => chord.notes().map(note => note.scientific()))
    const chordNoteNames = chords.map(chord => chord.simple())
    console.log(chordNames)
    console.log(chordNotes)

    if (options['midi'].enabled) { //write Midi
      let track = new MidiWriter.Track();
      try {
        const writer = new MidiWriter.Writer(addChord(track, chordNotes));
        writer.saveMIDI(chordNames[0]);
      } catch(error) {
        console.log('SOMETHING HAPPENED TO CHORD!!!')
        options['midi'].enabled = false;
      }
    }

    message.channel.send(chordMessage(chordNames, chordNoteNames));
    //send Midi file
    if (options['midi'].enabled) sendAndDelete(message, `${chordNames[0]}.mid`);
  }
}
