const { getIntentFromNLP } = require("../services/chatbotService");
const LoanType = require("../models/LoanType");
const LoanScheme = require("../models/LoanScheme");


// ============================================
// CHATBOT MESSAGE
// ============================================

const sendMessage = async (req, res) => {
  try {
    const { message } = req.body || {};

    // Validate message
    if (!message || !message.trim()) {
      return res.status(400).json({
        message: "Chat message is required"
      });
    }

    // Get intent from Python NLP service
    let nlpResult = {
      intent: "fallback",
      confidence: 0,
      action: "SHOW_HELP"
    };

    try {
      nlpResult = await getIntentFromNLP(message);
    } catch (error) {
      console.warn(
        "NLP service unavailable, using fallback chatbot response"
      );
    }

    const { intent, confidence, action } = nlpResult;

    let responseText = "";
    let data = null;


    // ============================================
    // HANDLE CHATBOT ACTIONS
    // ============================================

    switch (action) {

      case "SHOW_HOME":
        responseText =
          "Hello! I can help you explore loans, check eligibility, find required documents, and track your application.";
        break;


      case "SHOW_LOAN_TYPES":
        const loanTypes = await LoanType.find();

        responseText =
          "Here are the loan types currently available.";

        data = loanTypes;
        break;


      case "SHOW_SCHEMES":
        const loanSchemes = await LoanScheme.find({
          isActive: true
        });

        responseText =
          "Here are the available loan schemes.";

        data = loanSchemes;
        break;


      case "SHOW_ELIGIBILITY":
        responseText =
          "I can help you check your loan eligibility. You can start an eligibility check by providing your loan and income details.";
        break;


      case "SHOW_DOCUMENTS":
        responseText =
          "The required documents depend on the loan scheme you choose. Please select a loan scheme to see the required documents.";
        break;


      case "SHOW_APPLICATION_STATUS":
        responseText =
          "I can help you check your loan application status. Please log in to view your application details.";
        break;


      case "CHECK_ACCOUNT_HOLDER":
        responseText =
          "I can check whether you are a registered bank customer after you log in.";
        break;


      case "OPEN_APPLICATION_FORM":
        responseText =
          "You can start your loan application by selecting a loan type and scheme.";

        break;


      case "END_CHAT":
        responseText =
          "You're welcome! If you need help with a loan later, feel free to come back.";
        break;


      case "SHOW_HELP":
      default:
        responseText =
          "I'm sorry, I didn't understand that. You can ask me about loan types, schemes, eligibility, interest rates, documents, or application status.";
    }


    // ============================================
    // SEND RESPONSE
    // ============================================

    return res.status(200).json({
      message: "Chatbot response generated successfully",
      intent,
      confidence,
      action,
      response: responseText,
      data
    });

  } catch (error) {

    console.error(
      "Chatbot error:",
      error.message
    );

    return res.status(500).json({
      message: "Failed to process chatbot message"
    });
  }
};


module.exports = {
  sendMessage
};