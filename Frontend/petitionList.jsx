import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const PetitionList = () => {
  const [petitions, setPetitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchPetitions();
  }, []);

  const fetchPetitions = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/petitions?status=active"
      );
      setPetitions(response.data);
      setLoading(false);
    } catch (err) {
      setError("Failed to fetch petitions");
      setLoading(false);
    }
  };

  const handleClick = (id) => {
    navigate(`/petitions/${id}`);
  };

  if (loading) return <p>Loading petitions...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="container">
      <h2>Active Petitions</h2>

      {petitions.length === 0 ? (
        <p>No active petitions available.</p>
      ) : (
        <div className="petition-list">
          {petitions.map((petition) => (
            <div
              key={petition._id}
              className="petition-card"
              onClick={() => handleClick(petition._id)}
              style={{
                border: "1px solid #ccc",
                padding: "15px",
                marginBottom: "10px",
                cursor: "pointer",
                borderRadius: "8px",
              }}
            >
              <h3>{petition.title}</h3>
              <p><strong>Category:</strong> {petition.category}</p>
              <p><strong>Location:</strong> {petition.location}</p>
              <p><strong>Status:</strong> {petition.status}</p>
              <p>
                <strong>Signatures:</strong>{" "}
                {petition.signatures ? petition.signatures.length : 0}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PetitionList;
