"""Minimal Telegram bot that opens the game as a Mini App.

Usage:
  pip install -r requirements.txt
  set BOT_TOKEN=123456:ABC...        (Windows CMD)   |  export BOT_TOKEN=...  (Linux/Mac)
  set GAME_URL=https://USERNAME.github.io/REPO/
  python bot.py
"""
import os
from telegram import InlineKeyboardButton, InlineKeyboardMarkup, MenuButtonWebApp, Update, WebAppInfo
from telegram.ext import Application, CommandHandler, ContextTypes

TOKEN = os.environ["BOT_TOKEN"]
GAME_URL = os.environ["GAME_URL"]


async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    kb = InlineKeyboardMarkup([[InlineKeyboardButton("Play RELIC", web_app=WebAppInfo(url=GAME_URL))]])
    await update.message.reply_text("Welcome, Seeker! Tap the button to start your adventure.", reply_markup=kb)


async def post_init(app: Application):
    # Also puts a "Play" button next to the message box
    await app.bot.set_chat_menu_button(menu_button=MenuButtonWebApp(text="Play", web_app=WebAppInfo(url=GAME_URL)))


app = Application.builder().token(TOKEN).post_init(post_init).build()
app.add_handler(CommandHandler("start", start))
app.run_polling()
