import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

function RepositoryDetails() {
  const { repoName } = useParams(); // Get repo name from URL
  const navigate = useNavigate();
  const [datas, setData] = useState([]); // State for fetched data
  const userData = JSON.parse(localStorage.getItem("currentUser"));

  const { data } = userData;

  useEffect(() => {
    fetch(data.data.repos_Url)
      .then((res) => res.json())
      .then((res) => {
        setData(res);
      })
      .catch((err) => {
        console.error("Error fetching data:", err);
      });
  }, []);

  // Find the repository based on name (case-insensitive)
  const repo = datas.find(
    (repo) => repo.name.toLowerCase() === repoName.toLowerCase()
  );

  // Display a loading state while fetching data
  if (!datas || datas.length === 0) {
    return <p style={styles.loading}>Loading...</p>;
  }

  // Handle case where repository is not found
  if (!repo) {
    return <p style={styles.error}>Repository not found</p>;
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>{repo.name}</h1>
      <p style={styles.description}>{repo.description || "No description available"}</p>
      <a href={repo.html_url} style={styles.cardLink} target="_blank" rel="noreferrer">
                View Repository
              </a>
              <br /><br />
      <button style={styles.button} onClick={() => navigate("/repos")}>
        Back to Repositories
      </button>
    </div>
  );
}

const styles = {
  container: {
    textAlign: "center",
    padding: "20px",
    maxWidth: "600px",
    margin: "0 auto",
    fontFamily: "Arial, sans-serif",
    backgroundColor: "#f9f9f9",
    borderRadius: "10px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
  },
  heading: {
    fontSize: "28px",
    fontWeight: "bold",
    color: "#333",
    marginBottom: "20px",
  }, cardLink: {
    fontSize: "14px",
    color: "#007BFF",
    textDecoration: "none",
    fontWeight: "bold",
  },
  description: {
    fontSize: "16px",
    color: "#555",
    marginBottom: "20px",
  },
  button: {
    backgroundColor: "#007BFF",
    color: "#FFF",
    border: "none",
    borderRadius: "5px",
    padding: "10px 15px",
    cursor: "pointer",
    fontSize: "14px",
  },
  buttonHover: {
    backgroundColor: "#0056b3",
  },
  loading: {
    fontSize: "18px",
    color: "#555",
    textAlign: "center",
  },
  error: {
    fontSize: "18px",
    color: "red",
    textAlign: "center",
  },
};

export default RepositoryDetails;
