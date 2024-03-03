const { Client, LocalAuth, MessageMedia } = require('./whatsapp-web.js/index');
const qrcode = require('qrcode-terminal');
const movieInfo = require('movie-info');
const {prefix, base, owner} = require('./settings.json');
 

const client = new Client({
    authStrategy: new LocalAuth({
        dataPath: 'session'
    })
});

client.on('loading_screen', (percent, message) => {
    console.log('LOADING SCREEN', percent, message);
});

client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });
});

client.on('authenticated', () => {
    console.log('AUTHENTICATED');
});

client.on('auth_failure', msg => {
    // Fired if session restore was unsuccessful
    console.error('AUTHENTICATION FAILURE', msg);
});
client.on('ready', () => {
    console.log('Client is ready!');
});


client.on('message', async (message) => {
    const chat = await message.getChat();

    if (message.body === '!ping') {
		await message.reply('pong');
	}
	else if (message.body === 'alive') {
		await message.reply('*Movie Bot is Alive Now!*');
        message.react('😒')
	}
    else if (message.body === 'movie') {
        await message.reply('*Please enter a movie name to Upload!*');
        message.react('⚠️')
    }
    else if (message.body === '!everyone') {
        const chat = await message.getChat();
        
        let text = '';
        let mentions = [];

        for (let participant of chat.participants) {
            mentions.push(`${participant.id.user}@c.us`);
            text += `@${participant.id.user} `;
        }

        await chat.sendMessage(text, { mentions });
    }
    else if (message.body.startsWith('fmovie')) {
        
        //const media = await MessageMedia.fromFilePath('./img/default.png');
        //chat.sendMessage(media, {caption : `This is a Test Message`});
        // Remove the "fmovie" prefix and leading space (if any)
        const movieTitle = message.body.slice(6).trim();
        movieInfo(movieTitle)
    .then(() => sendMovieImage(movieTitle))
    .catch((error) => {
      // Handle errors directly in the outer `.catch`
      console.error('Error:', error);
      message.reply(`An error occurred: ${error}`);
      message.react('⚠️');
    });

        /*const imageUrl = movieInfo(movieTitle)
        .then(response =>{ 
            
            const formattedImage = (response.imageBase + response.poster_path);
            //const media = await MessageMedia.fromUrl(formattedImage);
            //chat.sendMessage(media);
            //message.reply('`Image must be sent now!` \n' + formattedImage);
             
      
        })
        .catch((error) => {
            // Handle any errors that occur during movieInfo retrieval
            console.error('Error retrieving movie info:', error);
            message.reply(`Sorry, I couldn\'t find an image for that movie.* \n${error}`);
            message.react('⚠️');
        });
        */
        async function sendMovieImage(movieTitle) {
            try {
              const response = await movieInfo(movieTitle);
              const formattedImage = response.imageBase + response.poster_path;
              const media = await MessageMedia.fromUrl(formattedImage);
              chat.sendMessage(media);
              message.reply('`Image sent!` \n' + formattedImage);
            } catch (error) {
              console.error('Error retrieving movie info:', error);
              message.reply(`Sorry, I couldn't find an image for that movie.* \n${error}`);
              message.react('⚠️');
            }
          }
          
          
          //movie info below
        movieInfo(`${movieTitle}`).then((movieData) => {
            
            const formattedMessage = createMovieMessage(movieData);
            //const media = MessageMedia.fromUrl(formattedImage);
            //client.sendMessage(message.from, media, {caption : `${formattedMessage}`})
            message.reply(formattedMessage);
            message.react('🏷️')
        })
        .catch((error) => {
            // Handle any errors that occur during movieInfo retrieval
            console.error('Error retrieving movie info:', error);
            message.reply(`*Sorry, I couldn\'t find information for that movie.* \n${error}`);
            message.react('⚠️');
        });
}
function createMovieMessage(movieData) {

    // Format the message with proper line breaks and spacing
    return `
*${movieData.original_title}*

_${movieData.overview}_

*▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀*
 🎭 Genres      = ${movieData.genre_ids}  
 📅 Release     = ${movieData.release_date}
 🌟 Rating       = ${movieData.vote_average}/10
 🍿 Popularity = ${movieData.popularity}
 🏷️ Subtitles   = si
 🔤 Language = ${movieData.original_language} 
 🔞 Adult        = ${movieData.adult}
*▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄*

*Reacts (👍❤️😂😮😢🍿)* 

> *${base}*
`;
            
            
}
});


client.initialize();