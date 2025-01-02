import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function RepositoryList() {
  const navigate = useNavigate();
  const userData = JSON.parse(localStorage.getItem("currentUser"));
  let [repo, setRepo] = useState([]);

  // Redirect to the home page if no user data exists
  if (!userData) {
    navigate("/");
    return null;
  }

  const { data } = userData;

  console.log(data);

  useEffect(() => {
    fetch(data.data.repos_Url)
      .then((res) => {
        if (!res.ok) {
          throw new Error(Error `fetching repositories: ${res.statusText}`);
        }
        return res.json();
      })
      .then((repoData) => {
        setRepo(repoData);
      })
      .catch((error) => {
        console.error("Error:", error);
        // Handle error appropriately, e.g., show a message to the user
      });
  }, [data.data.username]);

  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>{data.data.name||data.data.username || data.data.login}'s Repositories</h1>
      <img src={data.data.avatar} alt="User Avatar" style={styles.avatar} />
      <div style={styles.buttonGroup}>
        <button style={styles.button} onClick={() => navigate("/followers")}>
          View Followers
        </button>
        <button style={styles.button} onClick={() => navigate("/")}>
          Back to Search
        </button>
      </div>
      <ul style={styles.list}>
        {repo.length > 0 ? (
          repo.map((rep) => (
            <li key={rep.id} style={styles.listItem}>
              <Link to={`/repos/${rep.name}`} style={styles.link}>
                {rep.name}
              </Link>
            </li>
          ))
        ) : (
          <li style={styles.loading}>Loading...</li>
        )}
      </ul>
    </div>
  );
}

const styles = {
  container: {
    textAlign: "center",
    maxWidth: "800px",
    margin: "0 auto",
    padding: "20px",
    fontFamily: "Arial, sans-serif",
  },
  heading: {
    fontSize: "24px",
    fontWeight: "bold",
    color: "#333",
    marginBottom: "20px",
  },
  avatar: {
    borderRadius: "50%",
    marginBottom: "20px",
  },
  buttonGroup: {
    marginBottom: "20px",
  },
  button: {
    backgroundColor: "#007BFF",
    color: "#FFF",
    border: "none",
    borderRadius: "5px",
    padding: "10px 15px",
    margin: "0 10px",
    cursor: "pointer",
    fontSize: "14px",
  },
  buttonHover: {
    backgroundColor: "#0056b3",
  },
  list: {
    listStyleType: "none",
    padding: "0",
    margin: "20px 0",
  },
  listItem: {
    marginBottom: "10px",
  },
  link: {
    textDecoration: "none",
    color: "#007BFF",
    fontSize: "18px",
  },
  linkHover: {
    textDecoration: "underline",
  },
  loading: {
    color: "#555",
    fontSize: "16px",
  },
};

export default RepositoryList;