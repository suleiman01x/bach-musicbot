const fs = require('fs');

function capitalize(note) {
  return note[0].toUpperCase() + note.substring(1);
}

function capArray(notes) {
  var capitalized = new Array();
  for (var note of notes) {
    capitalized.push(capitalize(note))
  }
  return capitalized;
}

function sendAndDelete(message, fileName) {
  message.channel.send({
  files: [{
    attachment: `./${fileName}`,
    name: `${fileName}`
    }]
  })
  .then(() => {
    fs.unlink(`${fileName}`, (err) => {
      if(err) console.log(err)
    });
  });

}

module.exports = {
  capArray: capArray,
  capitalize: capitalize,
  sendAndDelete: sendAndDelete
}
