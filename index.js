const express = require('express');
const path = require('path');
const mysql = require('mysql');
const session = require('express-session');
const cors = require('cors');

// Create a connection object
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'taskdb'
});

// Connect to the database
connection.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err.message);
    return;
  }
  console.log('Connected to the MySQL database!');
});

const app = express();

// Middleware to parse JSON data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the 'public' directory
app.use(express.static('public'));

// Set up express-session
app.use(session({
  secret: 'your_secret_key',
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: false, // true if using HTTPS
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 1 day
  }
}));

// Set up CORS
app.use(cors({
  origin: 'http://localhost:4400', // or whatever port your frontend runs on
  credentials: true
}));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/signup', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'signup.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// SIGNING UP
app.post('/signup', (req, res) => {
  const { name, email, number, username, password } = req.body;

  const query = `INSERT INTO users (name, email, number, username, password) VALUES (?, ?, ?, ?, ?)`;
  const values = [name, email, number, username, password];

  connection.query(query, values, (err, result) => {
    if (err) {
      console.error('Error inserting user:', err);
      res.status(500).json({ error: 'Database error' });
    } else {
      res.status(200).json({ message: 'User added successfully' });
    }
  });
});

//LOGIN
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  const query = "SELECT * FROM users WHERE username = ? AND password = ?";
  connection.query(query, [username, password], (err, result) => {
    if (err) {
      console.error("Login error:", err);
      return res.status(500).json({ success: false, message: "Server error" }); 
      // send JSON instead of text
    }

    if (result.length > 0) {
      console.log("Login successful!");
      const user = result[0];
      req.session.user = user;
      return res.json({ success: true, message: "Login successful", role: user.role });
    } else {
      return res.status(401).json({ success: false, message: "Invalid username or password" }); 
      // also send JSON here
    }
  });
});

//Display user name 
app.get('/api/user', (req, res) => {
  if (req.session.user) {
    res.json({ username: req.session.user.username });
  } else {
    res.status(401).json({ error: 'Not logged in' });
  }
});

//Check authentication
app.get('/check-auth', (req, res) => {

  if (req.session && req.session.user) {
    // req.session.user = user;
    console.log("Session set:", req.session.user);

    res.json({
      success: true,
      role: req.session.user.role,
      user: req.session.user

    });
  } else {
    res.status(401).json({ success: false, message: "Not authenticated" });
  }
});

//Add-task
app.post('/add-task', async (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const { title, description, status } = req.body;
  const userId = req.session.user.id;
  console.log("Adding task:", { title, description, status, userId })
  const query = "INSERT INTO task (title, description, status, users_id) VALUES (?, ?, ?, ?)";

  connection.query(query, [title, description, status, userId], (err, result) => {
    if (err) {
      console.error('Error adding task:', err);
      return res.status(500).json({ message: "Failed to add task" });
    }

    res.status(200).json({ message: "Task added successfully" });
  }
  );

});

//View  Tasks for admin
app.get('/get-task', async (req, res) => {
  // if (!req.session.user) {
  //     return res.status(401).json({ message: "Unauthorized" });
  // }
  // if (req.session.user.role !== 'admin') {
  //     return res.status(403).json({ message: "Forbidden" });
  // }
  const query = 'SELECT * FROM task';
  connection.query(query, (err, result) => {
    if (err) {
      console.error('Error getting tasks:', err.message);
      res.status(500).json({ error: 'Error fetching tasks from the database.' });
      return;
    }
    // Log the result to inspect the structure
    //console.log('Database result:', result);

    if (!Array.isArray(result)) {
      console.error('Expected result to be an array, but got:', typeof result);
      return res.status(500).json({ error: 'Unexpected database result format.' });
    }

    // Proceed to return the result if everything looks fine
    res.status(200).json(result);
  });
});

app.get('/get-users', async (req, res) => {
  const query = `
    SELECT u.id, u.name, u.email, u.number, ud.users_company AS company, ud.users_salary AS salary, 
           ud.users_designation AS designation, ud.users_location AS location
    FROM users u
    LEFT JOIN user_detail ud ON u.id = ud.users_id
  `;

  connection.query(query, (err, result) => {
    if (err) {
      console.error('Error getting users:', err.message);
      res.status(500).json({ error: 'Error fetching users from the database.' });
      return;
    }

    // Log the result to inspect the structure
    console.log(result); // This will help you inspect the structure of the data returned.

    res.status(200).json(result);
  });
});

//add user details for admin
app.post('/add-user-detail', (req, res) => {
  const { user_id, name, company, salary, designation, location } = req.body;

  if (!user_id || !name || !company || !salary || !designation || !location) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  const query = `
    INSERT INTO user_detail (users_name, users_company, users_salary, users_designation, users_location, users_id)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  connection.query(query, [name, company, salary, designation, location, user_id], (err, result) => {
    if (err) {
      console.error('Error inserting user detail:', err.message);
      return res.status(500).json({ error: 'Failed to insert user detail into the database.' });
    }

    res.status(200).json({ message: 'User detail added successfully.' });
  });
});

//add task for user by admin    
app.post('/add-tasks', (req, res) => {
  const { users_id, title, description, status } = req.body;

  if (!users_id || !title || !description || !status) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  // Check if user exists
  const query = 'SELECT * FROM users WHERE id = ?';
  connection.query(query, [users_id], (err, result) => {
    if (err) {
      console.error('Error checking user:', err);
      return res.status(500).json({ message: 'Database error' });
    }

    if (result.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    console.log("User found:");

    // Insert the task
    const insertQuery = 'INSERT INTO task (users_id, title, description, status) VALUES (?, ?, ?, ?)';
    connection.query(insertQuery, [users_id, title, description, status], (insertErr, insertResult) => {
      if (insertErr) {
        console.error('Error inserting task:', insertErr);
        return res.status(500).json({ message: 'Failed to add task' });
      }

      res.status(200).json({ message: 'Task added successfully' });
      console.log("Received request body:", req.body);
      console.log("Inserting task with values:", { users_id, title, description, status });

    });
  });
});

// Show Tasks for the logged-in user
app.get('/users', (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const userId = req.session.user.id; // Get logged-in user's ID
  const query = 'SELECT * FROM task WHERE users_id = ? ORDER BY id ASC';

  connection.query(query, [userId], (err, result) => {
    if (err) {
      console.error('Error getting tasks:', err.message);
      res.status(500).json({ error: 'Error fetching tasks from the database.' });
      return;
    }
    res.status(200).json(result);
  });
});

// Get user details by ID
app.get('/users/:id', (req, res) => {
  const { id } = req.params;

  const query = 'SELECT * FROM task WHERE id = ?';
  connection.query(query, [id], (err, results) => {
    if (err) {
      console.error('Error fetching user:', err);
      return res.status(500).send('Error fetching user');
    }

    if (results.length === 0) {
      return res.status(404).send('User not found');
    }

    res.json(results[0]);
  });
});

//LOGOUT
app.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ success: false, message: "Failed to log out" });
    }
    res.clearCookie('connect.sid');  // clear the session cookie
    res.status(200).json({ success: true, message: "Logged out successfully" });
  });
});


app.listen(4400, () => {
  console.log("Server is running on http://localhost:4400");
});