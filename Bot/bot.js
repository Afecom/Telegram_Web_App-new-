const { Telegraf } = require("telegraf");
const TOKEN = "6960937469:AAGvvAtDJmK4D1N8PIju7IY9VD9TJmmhTU8";
const bot = new Telegraf(TOKEN);

const web_link = "https://main--cheery-sunburst-0ccfbe.netlify.app/";

bot.start((ctx) => {
  ctx.reply("Visit Our Store", {
    reply_markup: {
      keyboard: [[{ text: "web app", web_app: { url: web_link } }]],
    },
  });
});


bot.launch();
