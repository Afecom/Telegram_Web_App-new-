// netlify/functions/proxy.js
const fetch = require('node-fetch');

exports.handler = async function (event, context) {
  try {
    const apiUrl = 'https://api.chapa.co/v1/transaction/initialize';
    const response = await fetch(apiUrl, {
      method: event.httpMethod,
      headers: {
        'Content-Type': 'application/json',
        // Add any other required headers here
      },
      body: event.body,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();

    return {
      statusCode: 200,
      body: JSON.stringify(data),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
