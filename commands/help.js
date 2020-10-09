const usageText = require('./usage.json').help;

module.exports = {
  name: 'help',
  description: 'helpを表示する',
  execute(message, args) {
    message.channel.send(usageText);
  }
}
