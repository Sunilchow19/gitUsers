import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function FollowersList() {
  const navigate = useNavigate();
  const userData = JSON.parse(localStorage.getItem("currentUser"));
  const [followersUrl, setFollowersUrl] = useState([]);

  if (!userData) {
    navigate("/");
    return null;
  }

  const { followers } = userData;
  const followersData = followers.users[0];

  useEffect(() => {
    if (followersData && followersData.followers_Url) {
      fetch(followersData.followers_Url)
        .then((res) => res.json())
        .then((res) => setFollowersUrl(res))
        .catch((err) => console.error("Error fetching followers:", err));
    }
  }, [followersData]);

  const handleFollowerClick = (followerUsername) => {
    Promise.all([
      fetch(`http://localhost:3000/user/${followerUsername}`).then((res) =>
        res.json()
      ),
      fetch(`http://localhost:3000/repo/${followerUsername}`).then((res) =>
        res.json()
      ),
      fetch(
        `http://localhost:3000/user/${followerUsername}/followers`
      ).then((res) => res.json()),
    ])
      .then(([data, repos, followers]) => {
        if (data.message === "Not Found") {
          throw new Error("User not found");
        }

        // Construct the data object in the desired format
        const updatedUserData = {
          data: data,
          repos: repos || [],
          followers: followers || [],
        };

        // Save the updated user data to localStorage
        localStorage.setItem("currentUser", JSON.stringify(updatedUserData));

        // Navigate to the /repos page
        navigate("/repos");
      })
      .catch((err) => {
        console.error(err);
        alert("Failed to fetch follower data. Please try again.");
      });
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>Followers</h1>
      <ul style={styles.list}>
        {followersUrl.map((follower) => (
          <li
            key={follower.id}
            style={styles.listItem}
            onClick={() => handleFollowerClick(follower.login)}
          >
            {follower.login}
          </li>
        ))}
      </ul>
      <button style={styles.button} onClick={() => navigate("/repos")}>
        Back to Repositories
      </button>
      <div style={styles.userDetails}>
        <strong>Username:</strong> {userData.data.data.username}
      </div>
      <div style={styles.userDetails}>
        <strong>Name:</strong> {userData.data.data.name}
      </div>
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
  },
  list: {
    listStyleType: "none",
    padding: "0",
    margin: "0 auto 20px",
  },
  listItem: {
    fontSize: "16px",
    color: "#007BFF",
    cursor: "pointer",
    padding: "10px 0",
    borderBottom: "1px solid #ddd",
    transition: "color 0.2s ease",
  },
  listItemHover: {
    color: "#0056b3",
  },
  button: {
    backgroundColor: "#007BFF",
    color: "#FFF",
    border: "none",
    borderRadius: "5px",
    padding: "10px 15px",
    cursor: "pointer",
    fontSize: "14px",
    marginTop: "20px",
    transition: "background-color 0.2s ease",
  },
  userDetails: {
    fontSize: "16px",
    marginTop: "10px",
    color: "#555",
  },
};

export default FollowersList;
