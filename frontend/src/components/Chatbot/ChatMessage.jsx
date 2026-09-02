const ChatMessage = ({ message }) => {
  return (
    <div
      className={`chat-message ${message.sender}`}
    >
      <div className="message-content">

        {/* Normal chatbot/user message */}
        <p>{message.text}</p>

        {/* Display loan types */}
        {message.sender === "bot" &&
          message.action === "SHOW_LOAN_TYPES" &&
          Array.isArray(message.data) &&
          message.data.length > 0 && (

            <div className="chat-data">

              {message.data.map((item) => (

                <div
                  className="chat-data-card"
                  key={item._id}
                >
                  <h4>{item.name}</h4>

                  <p>{item.description}</p>

                  <p>
                    <strong>Loan Amount:</strong>{" "}
                    ₹{item.minLoanAmount?.toLocaleString()}
                    {" - "}
                    ₹{item.maxLoanAmount?.toLocaleString()}
                  </p>

                  <p>
                    <strong>Interest Rate:</strong>{" "}
                    {item.minInterestRate}% -{" "}
                    {item.maxInterestRate}%
                  </p>

                  <p>
                    <strong>Repayment:</strong>{" "}
                    {item.minRepaymentYears} -{" "}
                    {item.maxRepaymentYears} years
                  </p>

                </div>

              ))}

            </div>
          )}

        {/* Display loan schemes */}
        {message.sender === "bot" &&
          message.action === "SHOW_SCHEMES" &&
          Array.isArray(message.data) &&
          message.data.length > 0 && (

            <div className="chat-data">

              {message.data.map((item) => (

                <div
                  className="chat-data-card"
                  key={item._id}
                >
                  <h4>{item.schemeName}</h4>

                  <p>{item.description}</p>

                  <p>
                    <strong>Loan Amount:</strong>{" "}
                    ₹{item.minLoanAmount?.toLocaleString()}
                    {" - "}
                    ₹{item.maxLoanAmount?.toLocaleString()}
                  </p>

                  {item.interestRate && (
                    <p>
                      <strong>Interest Rate:</strong>{" "}
                      {item.interestRate.min}% -{" "}
                      {item.interestRate.max}%
                    </p>
                  )}

                  <p>
                    <strong>Repayment:</strong>{" "}
                    {item.minRepaymentYears} -{" "}
                    {item.maxRepaymentYears} years
                  </p>

                </div>

              ))}

            </div>
          )}

      </div>
    </div>
  );
};

export default ChatMessage;