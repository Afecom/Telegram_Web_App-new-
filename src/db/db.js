const fetch = require('node-fetch');

const consumerKey = 'ck_0a1d0af37fc58d63e8925d487fa92f3c17e93726';
const consumerSecret = 'cs_54f05f6e23f158b1abde94968fb3a2d40aeb7ba7';


async function getData() {
  return fetch(
    `https://aveluxecosmetics.com/wp-json/wc/v3/products?consumer_key=${consumerKey}&consumer_secret=${consumerSecret}`
  )
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to fetch products from the API.");
      }

      return response.json();
    })
    .then((productsData) =>
      productsData.map((product) => ({
        title: product.name,
        price: product.price,
        Image: product.images[0].src,
        id: product.id,
      }))
    )
    .catch((error) => {
      console.error(error);
      return [];
    });
}

// Usage example
getData()
  .then((products) => {
    console.log(products);
  })
  .catch((error) => {
    console.error(error);
  });

  export { getData};