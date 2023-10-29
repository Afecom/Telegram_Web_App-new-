import { useState, useEffect } from "react";
import "./App.css";
import Card from "./Components/Card/Card";
import Cart from "./Components/Cart/Cart";
require('dotenv').config();
const { getData } = require("./db/db");
const Chapa = require('chapa')
const { Telegraf } = require('telegraf');
const axios = require('axios');

const BOT_TOKEN = process.env.BOT_TOKEN;
const bot = new Telegraf(BOT_TOKEN);

const CHAPA_TOKEN = process.env.CHAPA_TOKEN;

const urlParams = new URLSearchParams(window.location.search);
const chatId = urlParams.get('chat_id');


let foods = [];

async function fetchData() {
  try {
    const products = await getData();
    console.log(products);
    return products;
  } catch (error) {
    console.error(error);
    return [];
  }
}

async function initializeApp() {
  try {
    foods = await fetchData();
    // Now you can use the 'foods' variable here
    console.log(foods);

    // Your further logic with 'foods'

  } catch (error) {
    console.error(error);
  }
}
// Call initializeApp to start the process
initializeApp();


const tele = window.Telegram.WebApp;

function App() {
  const [foods, setFoods] = useState([]);

  useEffect(() => {
    const fetchDataAndSetState = async () => {
      try {
        const products = await fetchData();
        setFoods(products);
      } catch (error) {
        console.error(error);
      }
    };

    fetchDataAndSetState();
  }, []); 

  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    tele.ready();
  });

  const onAdd = (food) => {
    const exist = cartItems.find((x) => x.id === food.id);
    if (exist) {
      setCartItems(
        cartItems.map((x) =>
          x.id === food.id ? { ...exist, quantity: exist.quantity + 1 } : x
        )
      );
    } else {
      setCartItems([...cartItems, { ...food, quantity: 1 }]);
    }
  };

  const onRemove = (food) => {
    const exist = cartItems.find((x) => x.id === food.id);
    if (exist.quantity === 1) {
      setCartItems(cartItems.filter((x) => x.id !== food.id));
    } else {
      setCartItems(
        cartItems.map((x) =>
          x.id === food.id ? { ...exist, quantity: exist.quantity - 1 } : x
        )
      );
    }
  };

  const onCheckout = async () => {
    try {
      const totalAmount = cartItems.reduce(
        (acc, item) => acc + item.price * item.quantity,
        0
      );
        // Send the invoice using telegraf
        await bot.telegram.sendInvoice(chatId,cartItems,totalAmount);

      tele.MainButton.text = "Payment Successful!";
      tele.MainButton.show();
    } catch (error) {
      console.error(error);
      // Show an error message
      tele.MainButton.text = "Payment Failed!";
      tele.MainButton.show();
    }
  };

  return (
    <>
      <h1 className="heading">Order Food</h1>
      <Cart cartItems={cartItems} onCheckout={onCheckout}/>
      <div className="cards__container">
        {foods.map((food) => {
          return (
            <Card food={food} key={food.id} onAdd={onAdd} onRemove={onRemove} />
          );
        })}
      </div>
    </>
  );
}

export default App;
