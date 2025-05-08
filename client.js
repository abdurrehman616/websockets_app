const { createInterface } = require('readline');
const { io } = require('socket.io-client');

// Change the URL to match your server's location
const socket = io('http://localhost:8000');  // or the appropriate URL for your server

const regCLI = createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: 'REGISTER > ',
});

let cmdCLI;
let unreadMessages = [];
let username = '';

function printHelp() {
  console.log(`
📘 Available Commands:
  /user <receiverId> <message>      Send message to a specific user
  /groupmsg <groupId> <message>     Send message to a group
  /creategroup                      Create a new group
  /join <groupId>                   Join a group
  /leave <groupId>                  Leave a group
  /unread                           Show all unread messages
  /exit                             Exit the client
  /help                             Show this help message
`);
}

function initCommandCLI() {
  cmdCLI = createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: 'COMMAND > ',
  });

  printHelp();
  cmdCLI.prompt();

  cmdCLI.on('line', (line) => {
    const input = line.trim();
    const [command, ...args] = input.split(' ');

    switch (command) {
      case '/user':
        if (args.length < 2) {
          console.log('⚠️  Usage: /user <receiverId> <message>');
        } else {
          const receiverId = args[0];
          const message = args.slice(1).join(' ');
          socket.emit('send_message_to_user', { receiverId, message });
          console.log(`📤 Sent message to user ${receiverId}`);
        }
        break;

      case '/groupmsg':
        if (args.length < 2) {
          console.log('⚠️  Usage: /groupmsg <groupId> <message>');
        } else {
          const groupId = args[0];
          const message = args.slice(1).join(' ');
          socket.emit('send_message_to_group', { groupId, message });
          console.log(`📤 Sent message to group ${groupId}`);
        }
        break;

      case '/creategroup':
        socket.emit('create_group');
        break;

      case '/join':
        if (!args[0]) {
          console.log('⚠️  Usage: /join <groupId>');
        } else {
          const groupId = args[0];
          socket.emit('join_group', groupId);
          console.log(`✅ Joined group ${groupId}`);
        }
        break;

      case '/leave':
        if (!args[0]) {
          console.log('⚠️  Usage: /leave <groupId>');
        } else {
          const groupId = args[0];
          socket.emit('leave_group', groupId);
          console.log(`🚪 Left group ${groupId}`);
        }
        break;

      case '/unread':
        if (unreadMessages.length > 0) {
          console.log('📬 Unread Messages:');
          unreadMessages.forEach((msg, i) => {
            console.log(`[${i + 1}] From: ${msg.senderId} | Message: ${msg.message}`);
          });
        } else {
          console.log('📬 No unread messages');
        }
        break;

      case '/help':
        printHelp();
        break;

      case '/exit':
        console.log('👋 Disconnecting and exiting...');
        socket.disconnect();
        cmdCLI.close();
        process.exit(0);
        break;

      default:
        console.log('❓ Unknown command. Type `/help` for usage.');
    }

    cmdCLI.prompt();
  });

  socket.on('receive_message_from_user', ({ senderId, message }) => {
    console.log(`\n📩 New message from ${senderId}: ${message}`);
    unreadMessages.push({ senderId, message });
    cmdCLI.prompt();
  });

  socket.on('receive_message_from_group', ({ senderId, message }) => {
    console.log(`\n👥 Group message from ${senderId}: ${message}`);
    unreadMessages.push({ senderId, message });
    cmdCLI.prompt();
  });

  socket.on('group_created', ({ groupId }) => {
    console.log(`🎉 Group successfully created with ID: ${groupId}`);
    cmdCLI.prompt();
  });

  socket.on('error', (err) => {
    console.log(`❌ Error: ${err.msg}`);
    cmdCLI.prompt();
  });
}

socket.on('connect', () => {
  console.log(`✅ Connected to server with socket ID: ${socket.id}`);
  console.log('👤 Please register with: /register <username>');
  regCLI.prompt();

  regCLI.on('line', (line) => {
    const input = line.trim();
    const [command, ...args] = input.split(' ');

    if (command === '/register') {
      username = args.join(' ');
      if (!username) {
        console.log('⚠️  Username is required');
        regCLI.prompt();
      } else {
        socket.emit('register', username);
      }
    } else {
      console.log('❌ Unknown command. Use: /register <username>');
      regCLI.prompt();
    }
  });
});

socket.on('registered', ({ username, socketId }) => {
  console.log(`🎉 Registered as '${username}' with socket ID: ${socketId}`);
  regCLI.close();
  initCommandCLI();
});

socket.on('error', (err) => {
  console.log(`❌ Registration failed: ${err.msg}`);
  regCLI.prompt();
});
