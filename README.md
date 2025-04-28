# Task Management System

A simple Task Management System built using **Node.js**, **JavaScript**, **MySQL**, **HTML**, **CSS**, and **Bootstrap**. This application allows users to manage tasks, while admin users can manage and assign tasks to others.

## Features

- **User Authentication**:

  - User login and signup functionality.
  - Admin login for managing tasks and users.

- **Task Management**:

  - Users can create, view, edit, and delete tasks.
  - Admin can assign tasks to users and view tasks across all users.

- **Role-Based Access Control**:
        
  - Different roles (Admin, User, Manager, HR) with appropriate permissions.

- **Database Integration**:

  - Uses **MySQL** for data storage.
  - Two main tables: `users` (user details) and `user_detail` (additional details about users).

## Tech Stack

- **Frontend**:

  - HTML, CSS, and **Bootstrap** for the user interface.

- **Backend**:

  - **Node.js** for the server-side logic.
  - **Express** for routing and handling HTTP requests.
  - **MySQL** for database management.
  - **Bcrypt** for secure password hashing.

- **Additional Libraries/Tools**:

  - **Session** for secure user authentication.

## Installation

### Prerequisites

Make sure you have the following installed:

- [Node.js](https://nodejs.org/) (version 12 or higher)
- [MySQL](https://www.mysql.com/) or a MySQL-compatible database

### Steps to Run the Project Locally

1. Clone the repository:
   ```bash
   git clone https://github.com/ganeshkumart21/Task-Management.git
   ```
