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

module.exports = {
  capArray: capArray,
  capitalize: capitalize,
}
