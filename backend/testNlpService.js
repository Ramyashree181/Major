const { getIntentFromNLP } = require("./services/chatbotService");

const testNLP = async () => {
  try {
    const result = await getIntentFromNLP(
      "What loans does your bank offer?"
    );

    console.log("NLP Response:");
    console.log(result);
  } catch (error) {
    console.error("Test failed:", error.message);
  }
};

testNLP();