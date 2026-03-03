import { useEffect, useState } from "react";

const API_BASE = "http://localhost:5000";

export default function PetitionFilter() {
  const [petitions, setPetitions] = useState([]);
  const [filters, setFilters] = useState({
    location: "",
    category: "",
    status: "",
  });

  const [loading, setLoading] = useState(false);

  // Fetch petitions whenever filters change
  useEffect(() => {
    fetchPetitions();
  }, [filters]);

  const fetchPetitions = async () => {
    try {
      setLoading(true);

      const query = new URLSearchParams(filters).toString();

      const response = await fetch(`${API_BASE}/petitions?${query}`, {
        credentials: "include",
      });

      const data = await response.json();
      setPetitions(data);
    } catch (error) {
      console.error("Error fetching petitions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="p-4">
      <h2>Petition Filter View</h2>

      {/* ✅ Filters UI */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        <select name="location" value={filters.location} onChange={handleChange}>
          <option value="">All Locations</option>
          <option value="Hyderabad">Hyderabad</option>
          <option value="Bangalore">Bangalore</option>
          <option value="Chennai">Chennai</option>
        </select>

        <select name="category" value={filters.category} onChange={handleChange}>
          <option value="">All Categories</option>
          <option value="Environment">Environment</option>
          <option value="Education">Education</option>
          <option value="Infrastructure">Infrastructure</option>
        </select>

        <select name="status" value={filters.status} onChange={handleChange}>
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="under_review">Under Review</option>
          <option value="closed">Closed</option>
        </select>
      </div>

      {/* ✅ Loading */}
      {loading ? (
        <p>Loading petitions...</p>
      ) : (
        <div>
          {petitions.length === 0 ? (
            <p>No petitions found.</p>
          ) : (
            petitions.map((petition) => (
              <div
                key={petition._id}
                style={{
                  border: "1px solid #ddd",
                  padding: "10px",
                  marginBottom: "10px",
                }}
              >
                <h3>{petition.title}</h3>
                <p>{petition.description}</p>
                <small>
                  {petition.category} | {petition.location} | {petition.status}
                </small>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
