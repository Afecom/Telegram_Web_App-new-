import { useState, useEffect } from "react";
import "./App.css";
import Card from "./Components/Card/Card";
import Cart from "./Components/Cart/Cart";
import { v4 as uuidv4 } from 'uuid';
const { getData } = require("./db/db");
const fetch = require('node-fetch');
var closeApp = false;

const BOT_TOKEN = process.env.REACT_APP_BOT_TOKEN;
const CHAPA_TOKEN = process.env.REACT_APP_CHAPA_TOKEN;
const urlParams = new URLSearchParams(window.location.search);
const chat_id = urlParams.get('chat_id');

const generateUniquePayload = () => {
  const uniquePayload = uuidv4();
  return uniquePayload;
};


const payload  = generateUniquePayload();


let foods = [];

const sendInvoice = async (chatId, title, description, payload, providerToken, currency, prices) => {
  const apiUrl = `https://api.telegram.org/bot${BOT_TOKEN}/sendInvoice`;

  const requestBody = {
    chat_id: chatId,
    title,
    description,
    payload,
    provider_token: providerToken,
    currency,
    prices,
    need_name: true,
    need_phone_number: true,
    need_email: true,
    need_shipping_address: true,
    is_flexible: true,
  };

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    const responseData = await response.json();

    // Check the response data for success or handle errors
    if (responseData.ok) {
      console.log('Invoice sent successfully!');
    } else {
      console.error('Error sending invoice:', responseData.description);
      console.log(responseData);
    }
  } catch (error) {
    console.error('Error sending :', error.message);
    console.log(error.body);
  }
};
async function fetchData() {
  try {
    const products = await getData();
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
    if(closeApp){
      tele.close()
    }
    else{
      tele.ready();
    }
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
      const chatId = chat_id;
      const invoiceTitle = 'Orders';
      const invoiceDescription = cartItems
      .map(item => `${item.title} x${item.quantity} - ${item.price}`)
      .join(',\n');
      const invoicePayload = `${payload}`;
      const paymentProviderToken = CHAPA_TOKEN;
      const invoiceCurrency = 'ETB';
      const invoicePrices = [{ label: 'Total:',  amount: Math.round(totalAmount)  }];


      const response = await sendInvoice(
        chatId,
        invoiceTitle,
        invoiceDescription,
        invoicePayload,
        paymentProviderToken,
        invoiceCurrency,
        invoicePrices
      );

      if(response)
       tele.MainButton.text = `Invoice Sent, close this tab to proceed`;
        // console.log('Invoice Response:', response);
        // Send the invoice using telegraf
        // await bot.telegram.sendInvoice(chatId,cartItems,totalAmount);

      // tele.MainButton.text = "Payment Successful!";
      // tele.MainButton.show();
    } catch (error) {
      console.error(error);
      // Show an error message
      tele.MainButton.text = "Payment Failed!";
      tele.MainButton.show();
    }
  };

  return (
    <>
      <h1 className="heading">Order Products</h1>
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
