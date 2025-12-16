import React, { useState } from "react";
import { evaluate } from "mathjs";
import "./index.css"; // Importing external CSS

function Calculator() {
  const [input, setInput] = useState("");

  const handleClick = (value) => {
    if (value === "C") {
      setInput("");
    } else if (value === "=") {
      try {
        setInput(evaluate(input).toString());
      } catch (err) {
        setInput("Error");
      }
    } else if (value === "DEL") {
      setInput(input.slice(0, -1));
    } else {
      setInput(input + value);
    }
  };

  const buttons = [
    "C", "DEL", "/", "*",
    "7", "8", "9", "-",
    "4", "5", "6", "+",
    "1", "2", "3", ".",
    "0", "=",
  ];

  return (
    <div className="calc-container">
      <h2 className="title">🧮 React Calculator</h2>
      <input
        className="display"
        type="text"
        value={input}
        readOnly
        placeholder="0"
      />
      <div className="buttons-grid">
        {buttons.map((btn) => (
          <button
            key={btn}
            className={`btn ${btn === "=" ? "equals" : ""} ${
              btn === "C" ? "clear" : ""
            } ${btn === "DEL" ? "delete" : ""}`}
            onClick={() => handleClick(btn)}
          >
            {btn}
          </button>
        ))}
      </div>
    </div>
  );
}

export default Calculator;
