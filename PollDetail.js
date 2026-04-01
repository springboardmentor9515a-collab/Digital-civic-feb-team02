import React, { useState } from "react";

const PollDetail = () => {

  const role = localStorage.getItem("role"); // citizen / official

  const poll = {
    question: "Should the city build a new public park?",
    options: ["Yes", "No", "Maybe"]
  };

  const [selectedOption, setSelectedOption] = useState("");
  const [voted, setVoted] = useState(false);
  const [message, setMessage] = useState("");

  const handleVote = () => {

    if (!selectedOption) {
      setMessage("Please select an option");
      return;
    }

    setVoted(true);
    setMessage("Vote submitted successfully!");
  };

  return (
    <div>

      <h2>{poll.question}</h2>

      {poll.options.map((option, index) => (
        <div key={index}>
          <input
            type="radio"
            name="poll"
            value={option}
            disabled={voted}
            onChange={(e) => setSelectedOption(e.target.value)}
          />
          {option}
        </div>
      ))}

      {role === "citizen" && (
        <button onClick={handleVote} disabled={voted}>
          {voted ? "Already Voted" : "Vote"}
        </button>
      )}

      {message && <p>{message}</p>}

    </div>
  );
};

export default PollDetail;
