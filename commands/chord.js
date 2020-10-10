const usageText = require('./usage.json').chord;
const teoria = require('teoria');
const {capArray} = require('../lib/musicFormatting');
const MidiWriter = require('midi-writer-js');
const fs = require('fs');

function makeMidiTrack(teoriaNotes) {
  //inits track
  var track = new MidiWriter.Track();
  track.addEvent(new MidiWriter.NoteEvent({
    pitch: teoriaNotes[0].scientific(),
    duration: '1'
  }));

  for (var note in teoriaNotes) { //adds each note from 1
    var tempTrack = new MidiWriter.Track();
    tempTrack.addEvent(new MidiWriter.NoteEvent({
      pitch: teoriaNotes[note].scientific(),
      duration: '1'
    }))

    track.mergeTrack(tempTrack);
  }
  return track;
}

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

    // declare parsed chord
    const chordName = chord.name;
    const chordNotes = chord.notes()
    const chordNoteNames = chord.simple()

    if (args.includes('-midi')) { //write Midi
      var chordTrack = makeMidiTrack(chordNotes);
      var writer = new MidiWriter.Writer(chordTrack);
      writer.saveMIDI(chordName);
      var hasMidi = true;
    }

    console.log(`FILE NAME: ${chordName}`);
    message.channel.send(`${chordName}の音: ${capArray(chordNoteNames)}`);
    //send Midi file
    if (hasMidi) {message.channel.send({
      files: [{
        attachment: `./${chordName}.mid`,
        name: `${chordName}.mid`
        }]
      })
      .then(() => {
        fs.unlink(`${chordName}.mid`, (err) => {
          if(err) console.log(err)
        });
      });
    }
  }
}
