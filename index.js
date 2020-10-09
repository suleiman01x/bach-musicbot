const fs = require('fs');
const Discord = require('discord.js');
const client = new Discord.Client();
const {prefix, token} = require('./config.json');
client.commands = new Discord.Collection();

const commandFile = fs.readdirSync('./commands').filter(name => name.endsWith('.js'));

for (const file of commandFile) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.name, command);
}

client.on('ready', () => {
  console.log('I am ready!');
});

client.on('message', message => {
  if (!message.content.startsWith(prefix)) return

  var userInput = message.content.replace(/♭/g, 'b');
  var args = userInput.slice(prefix.length).trim().split(/ +/);
  var userCommand = args.shift().toLowerCase();

  if (!client.commands.has(userCommand)) {
    message.reply(`${userCommand}はコマンドとして認識されていません\n助けが必要な場合${prefix}helpを使用して下さい`);
    return
  }

  const command = client.commands.get(userCommand);

  try {
    command.execute(message, args);
  } catch (error) {
    console.error(error);
    message.reply(`${userCommand}を実行中にエラー`)
  }

});

client.login(token);
