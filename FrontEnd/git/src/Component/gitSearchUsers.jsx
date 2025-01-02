import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function SearchPage() {
  const [username, setUsername] = useState("");
  const [cachedData, setCachedData] = useState({});
  const navigate = useNavigate();

  const fetchData = (user) => {
    if (cachedData[user]) {
      localStorage.setItem("currentUser", JSON.stringify(cachedData[user]));
      navigate("/repos");
      return;
    }

    Promise.all([
      fetch(`http://localhost:3000/user/${user}`).then((res) => res.json()),
      fetch(`http://localhost:3000/repo/${user}`).then((res) => res.json()),
      fetch(`http://localhost:3000/user/${user}/followers`).then((res) =>
        res.json()
      ),
    ])
      .then(([data, repos, followers]) => {
        if (data.message === "Not Found") throw new Error("User not found");
        const userData = { data, repos, followers };
        setCachedData((prev) => ({ ...prev, [user]: userData }));
        localStorage.setItem("currentUser", JSON.stringify(userData));
        navigate("/repos");
      })
      .catch((err) => {
        console.error(err);
        alert("Failed to fetch user data. Please try again.");
      });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchData(username);
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>GitHub User Search</h1>
      <form onSubmit={handleSubmit} style={styles.form}>
        <input
          type="text"
          placeholder="Enter GitHub username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={styles.input}
        />
        <button type="submit" style={styles.button}>Search</button>
      </form>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    backgroundColor: "#f4f6f9",
    fontFamily: "'Roboto', sans-serif",
  },
  heading: {
    fontSize: "32px",
    fontWeight: "bold",
    color: "#333",
    marginBottom: "20px",
  },
  form: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff",
    padding: "20px",
    borderRadius: "8px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
  },
  input: {
    padding: "10px",
    marginRight: "10px",
    fontSize: "16px",
    width: "250px",
    border: "1px solid #ddd",
    borderRadius: "5px",
    outline: "none",
    transition: "border-color 0.2s ease",
  },
  inputFocus: {
    borderColor: "#007bff",
  },
  button: {
    padding: "10px 20px",
    fontSize: "16px",
    backgroundColor: "#007bff",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    transition: "background-color 0.3s ease",
  },
  buttonHover: {
    backgroundColor: "#0056b3",
  },
};

export default SearchPage;
