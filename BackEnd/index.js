// Required Libraries
const express = require("express");
const axios = require("axios");
const mysql = require("mysql2");
const cors = require("cors");
const dotenv=require("dotenv")
// Initialize App

dotenv.config()

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
// Database Connection
const db = mysql.createConnection({
  host: process.env.db_host,
  user: process.env.db_user,
  password: process.env.db_password,
  database: process.env.db_database,
});

db.connect((err) => {
  if (err) {
    console.error("Database connection failed:", err.stack);
    return;
  } else {
    console.log("Connected to database.");
  }
});

// Endpoint to get user data or fetch from GitHub API if not found
app.get("/user/:username", async (req, res) => {
  const username = req.params.username;

  try {
    // Check if the user exists in the database
    const checkUserQuery = `SELECT * FROM users WHERE username = ? AND is_deleted = FALSE`;
    db.query(checkUserQuery, [username], async (err, results) => {
      if (err) {
        return res.status(500).send({
          message: "Database error while checking user.",
          error: err,
        });
      }

      if (results.length > 0) {
        // If the user exists, return the data
        return res.status(200).send({
          message: "User exists in the database.",
          status:200,
          data: results[0],
        });
      }

      try {
        // If user does not exist, fetch from GitHub API
        const response = await axios.get(
          `https://api.github.com/users/${username}`
        );
        const data = response.data;

        // Prepare the data for insertion
        const insertQuery = `
                    INSERT INTO users 
                    (username, location, blog, bio, public_repos, public_gists, followers, following, created_at, updated_at, name, avatar, followers_url, following_url, repos_url) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `;
        const values = [
          data.login,
          data.location || null,
          data.blog || null,
          data.bio || null,
          data.public_repos,
          data.public_gists,
          data.followers,
          data.following,
          new Date(data.created_at),
          new Date(),
          data.name || null,
          data.avatar_url || null,
          data.followers_url,
          data.following_url,
          data.repos_url,
        ];

        // Insert the data into the database
        db.query(insertQuery, values, (err) => {
          if (err) {
            return res.status(500).send({
              message: "Error saving user data.",
              error: err,
            });
          }

          // Return the same data we just fetched and saved
          res.status(201).send({
            message:
              "User data fetched from GitHub, saved, and retrieved successfully.",
              status:201,
            data: {
              username: data.login,
              location: data.location || null,
              blog: data.blog || null,
              bio: data.bio || null,
              public_repos: data.public_repos,
              public_gists: data.public_gists,
              followers: data.followers,
              following: data.following,
              created_at: new Date(data.created_at),
              updated_at: new Date(),
              name: data.name || null,
              avatar: data.avatar_url || null,
              followers_Url: data.followers_url,
              following_Url: data.following_url,
              repos_Url: data.repos_url,
            },
          });
        });
      } catch (error) {
        res.status(500).send({
          message: "Error fetching data from GitHub API.",
          error: error.message,
        });
      }
    });
  } catch (error) {
    res.status(500).send({
      message: "Internal server error.",
      error: error.message,
    });
  }
});

// Endpoint to get repositories of a user
app.get("/repos/:username", async (req, res) => {
  const username = req.params.username;

  try {
    // Fetch repositories for the given username from GitHub
    const response = await axios.get(
      `https://api.github.com/users/${username}/repos`
    );
    const repos = response.data;

    // Return the repositories
    res.status(200).send({
      message: "Repositories fetched successfully.",
      data: repos,
    });
  } catch (error) {
    res.status(500).send({
      message: "Error fetching repositories from GitHub API.",
      error: error.message,
    });
  }
});

// API 2: Find and Save Mutual Friends
app.post("/user/:username/friends", (req, res) => {
  const username = req.params.username;

  // Get user data
  db.query(
    "SELECT * FROM users WHERE username = ? AND is_deleted = FALSE",
    [username],
    (err, results) => {
      if (err)
        return res.status(500).send({ message: "Database error.", error: err });
      if (results.length === 0)
        return res
          .status(404)
          .send({ message: "User not found in the database." });

      const userId = results[0].id;

      Promise.all([
        axios.get(`https://api.github.com/users/${username}/followers`),
        axios.get(`https://api.github.com/users/${username}/following`),
      ])
        .then(([followersResponse, followingResponse]) => {
          const followers = followersResponse.data;
          const following = followingResponse.data;
          const mutuals = followers.filter((f) =>
            following.some((ff) => ff.login === f.login)
          );

          mutuals.forEach((mutual) => {
            db.query(
              "SELECT * FROM users WHERE username = ? AND is_deleted = FALSE",
              [mutual.login],
              (err, results) => {
                if (err) return;
                if (results.length > 0) {
                  const friendId = results[0].id;
                  db.query(
                    "INSERT IGNORE INTO friends (user_id, friend_id) VALUES (?, ?)",
                    [userId, friendId]
                  );
                }
              }
            );
          });

          res
            .status(200)
            .send({
              message: "Mutual friends saved successfully.",
              friends: mutuals.map((m) => m.login),
            });
        })
        .catch((error) => {
          res
            .status(500)
            .send({
              message: "Error fetching friends from GitHub API.",
              error: error.message,
            });
        });
    }
  );
});

// API 3: Search all Users
app.get("/users", (req, res) => {
  const { username, location } = req.query;
  let query = "SELECT * FROM users WHERE is_deleted = FALSE";
  const conditions = [];

  if (username) {
    conditions.push(`username LIKE '%${username}%'`);
  }
  if (location) {
    conditions.push(`location LIKE '%${location}%'`);
  }

  if (conditions.length > 0) {
    query += " AND " + conditions.join(" AND ");
  }

  db.query(query, (err, results) => {
    if (err)
      return res.status(500).send({ message: "Database error.", error: err });
    res.status(200).send({ users: results });
  });
});

// API 4: Soft Delete User
app.delete("/user/:username", (req, res) => {
  const username = req.params.username;

  db.query(
    "UPDATE users SET is_deleted = TRUE WHERE username = ?",
    [username],
    (err) => {
      if (err)
        return res.status(500).send({ message: "Database error.", error: err });
      res.status(200).send({ message: "User soft deleted successfully." });
    }
  );
});

// API 5: Update User Details
app.put("/user/:username", (req, res) => {
  const username = req.params.username;
  console.log(req.body);
  const { location, blog, bio } = req.body;

  const updates = [];
  if (location) updates.push(`location = '${location}'`);
  if (blog) updates.push(`blog = '${blog}'`);
  if (bio) updates.push(`bio = '${bio}'`);

  if (updates.length > 0) {
    const query = `UPDATE users SET ${updates.join(
      ", "
    )}, updated_at = NOW() WHERE username = ?`;
    db.query(query, [username], (err) => {
      if (err)
        return res.status(500).send({ message: "Database error.", error: err });
      res.status(200).send({ message: "User updated successfully." });
    });
  } else {
    res.status(400).send({ message: "No valid fields to update." });
  }
});

// API 6: Sort Users by Field
app.get("/users/sorted", (req, res) => {
  console.log(req.query);

  const { sortBy } = req.query;
  const validFields = [
    "public_repos",
    "public_gists",
    "followers",
    "following",
    "created_at",
  ];

  if (!validFields.includes(sortBy)) {
    return res.status(400).send({ message: "Invalid sort field." });
  }

  db.query(
    `SELECT * FROM users WHERE is_deleted = FALSE ORDER BY ${sortBy} DESC`,
    (err, results) => {
      if (err)
        return res.status(500).send({ message: "Database error.", error: err });
      res.status(200).send({ users: results });
    }
  );
});

//API 7: get repos username API
app.get("/repo/:username", (req, res) => {
  let username = req.params.username;

  let query = "SELECT repos_Url FROM users WHERE username = ? ";

  db.query(query, username, (err, results) => {
    if (err)
      return res.status(500).send({ message: "Database error.", error: err });
    res.status(200).send({ users: results });
  });
});

//API 8: Get specified username followers API
app.get("/user/:username/followers", (req, res) => {
  let username = req.params.username;

  let query = "SELECT followers_Url FROM users WHERE username = ? ";

  let repos = query.users;

  // res.send(repos)

  db.query(query, username, (err, results) => {
    if (err)
      return res.status(500).send({ message: "Database error.", error: err });
    res.status(200).send({ users: results });
  });
});

// Start the Server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
