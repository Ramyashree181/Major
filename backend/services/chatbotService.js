const axios = require("axios");

const NLP_SERVICE_URL = (process.env.NLP_SERVICE_URL || "http://127.0.0.1:5002")
  .replace(/\/+$/, "");

const getIntentFromNLP = async (message) => {
  try {
    const response = await axios.post(`${NLP_SERVICE_URL}/predict`, {
      message
    });

    return response.data;
  } catch (error) {
    console.error(
      "NLP Service Error:",
      error.response?.data || error.message
    );

    throw new Error("NLP service is unavailable");
  }
};

module.exports = {
  getIntentFromNLP
};