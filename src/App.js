import { useState, useEffect } from "react";
import "./App.css";
import Card from "./Components/Card/Card";
import Cart from "./Components/Cart/Cart";
const { getData } = require("./db/db");
const Chapa = require('chapa')

let myChapa = new Chapa('CHASECK_TEST-eC87BpqSy1pYXrU1JvLZ6ziQELiOaxTC')


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
      // Generate transaction reference using our utility method or provide your own
      //const tx_ref = await myChapa.generateTransactionReference();

      const totalAmount = cartItems.reduce(
        (acc, item) => acc + item.price * item.quantity,
        0
      );
      const customerInfo =  {
        amount: totalAmount,
        currency: 'ETB',
        email: 'abebe@bikila.com',
        first_name: 'Abebe',
        last_name: 'Bikila',
        // tx_ref: tx_ref, // if autoRef is set in the options we dont't need to provide reference, instead it will generate it for us
        callback_url: 'https://chapa.co', // your callback URL
        customization: {
            title: 'I love e-commerce',
            description: 'It is time to pay'
        }
    }
    // async/await
    let response = await myChapa.initialize(customerInfo, { autoRef: true })

    // myChapa.verify('txn-reference').then(response => {
    //     console.log(response) // if success
    // }).catch(e => console.log(e)) // catch errors

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
