gitUsers

This project is designed to manage users from GitHub using a backend API and a simple frontend interface. The backend stores and retrieves user data from a database.

Project Structure

BackEnd
- index.js: The main entry point for the backend API.
- Database configuration: Connects to a MySQL database (`git_users`).

FrontEnd
- git/: Contains frontend code for displaying GitHub user data.

Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Sunilchow19/gitUsers.git
   ```

2. Navigate to the project directory:
   ```bash
   cd gitUsers
   ```

3. Install dependencies for the backend:
   ```bash
   cd BackEnd
   npm install
   ```

4. Setup the database connection by creating a `.env` file in the `BackEnd` folder and adding your MySQL credentials:
   ```bash
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=yourpassword
   DB_NAME=git_users
   ```

5. Run the backend server:
   ```bash
   npm start
   ```

6. Navigate to the frontend directory and install dependencies:
   ```bash
   cd FrontEnd/git
   npm install
   ```

7. Start the frontend application:
   ```bash
   npm start
   ```

Features
- Fetches and displays GitHub user data.
- Provides an API for querying users from the GitHub database.
  
Frontend Routing
This application uses React Router to handle routing between different pages.

Routes
/ (Home): Displays the search page for repositories and users.
/repos: Lists all repositories.
/repos/:repoName: Displays detailed information for a specific repository.
/followers: Displays a list of followers.

Contributing
Feel free to open issues or submit pull requests to enhance the project.

License
This project is licensed under the MIT License.
