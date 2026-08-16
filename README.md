# 📚 The Shelf – A Personal Library

**The Shelf** is a modern personal library application that allows users to create, organize, and manage their own digital bookshelf.

Originally developed as a **frontend web application using HTML, CSS, and JavaScript**, the project has now been extended into a **full-stack desktop application**. It includes a backend server, database connectivity, and **Electron.js integration** to provide a standalone desktop experience.

Users can add, edit, delete, search, sort, rate, and review books through an elegant and responsive interface. The application also supports persistent data storage through a backend and database.

---

## ✨ Features

### 📖 Book Management

* Add new books to your personal library
* Edit existing book information
* Delete books from the collection
* View complete book details
* Store and manage books using a database

### 🔍 Search and Sorting

Search books by:

* Book title
* Author name

Sort books by:

* Recently Added
* Title (A–Z)
* Author (A–Z)
* Highest Rating

### ⭐ Rating and Reviews

* Rate books using a 5-star rating system
* Write and manage personal book reviews
* View ratings and reviews in the book details section

### 🖼️ Book Cover Management

Add book covers using:

* Image URL
* Local file upload

Additional features:

* Preview cover images before saving
* Display book covers in a digital bookshelf layout

### 👀 Book Details

Click on a book to view detailed information in a catalog-style modal, including:

* Book Cover
* Title
* Author
* Rating
* Review

### 💻 Desktop Application

The project has been enhanced using **Electron.js** to provide a desktop application experience.

* Run the application as a desktop app
* Access the frontend through a native application window
* Integrate frontend and backend functionality
* Package the application for desktop distribution
* Provide a standalone application experience without manually opening the website in a browser

### 🗄️ Backend and Database

The project now includes backend functionality for managing application data.

* Backend server using Node.js
* REST-style communication between frontend and backend
* Database connectivity using MySQL
* Persistent storage for book information
* CRUD operations:

  * Create
  * Read
  * Update
  * Delete

---

## 🛠️ Technologies Used

### Frontend

* HTML5
* CSS3
* JavaScript (Vanilla JS)

### Backend

* Node.js
* Express.js
* MySQL
* MySQL2
* CORS
* dotenv

### Desktop Application

* Electron.js

### Development Tools

* Visual Studio Code
* MySQL Workbench
* SQLTools

---

## 📂 Project Structure

```text
The_Shelf/
│
├── FrontEnd/
│   ├── index.html
│   ├── style.css
│   ├── script.js
│   └── assets/
│       └── images/
│
├── BackEnd/
│   ├── server.js
│   ├── database.js
│   └── ...
│
├── electron/
│   ├── main.js
│   └── preload.js
│
├── package.json
├── package-lock.json
├── .env
├── README.md
└── node_modules/
```

> *Note: The exact project structure may vary depending on the final organization of your frontend, backend, and Electron files.*

---

## ⚙️ Installation

### 1. Clone the Repository

```bash
git clone https://github.com/Jtithy/The_Shelf.git
```

Move into the project directory:

```bash
cd The_Shelf
```

### 2. Install Dependencies

```bash
npm install
```

If required, install the main dependencies:

```bash
npm install express mysql2 cors dotenv electron
```

---

## 🗄️ Database Setup

Make sure **MySQL Server** is running.

Create a database for the application:

```sql
CREATE DATABASE the_shelf;
```

Select the database:

```sql
USE the_shelf;
```

Create the required tables based on your application's database schema.

---

## 🔐 Environment Variables

Create a `.env` file in the project root.

Example:

```env
DB_HOST=127.0.0.1
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=the_shelf
DB_PORT=3306
```

> ⚠️ Never upload your `.env` file or database password to GitHub.

You can add the following to your `.gitignore` file:

```text
node_modules/
.env
```

---

## ▶️ Running the Application

### Run the Backend Server

From the project directory:

```bash
node server.js
```

Or, if your backend file is located in another directory:

```bash
node BackEnd/server.js
```

The backend server will handle communication between the application and the MySQL database.

---

### Run the Desktop Application

Start the Electron application:

```bash
npm start
```

Depending on your `package.json` configuration, you may also use:

```bash
npm run electron
```

The application should open in a native desktop window.

---

## 🏗️ Building the Desktop Application

After configuring Electron and an application packaging tool, the project can be built into a distributable desktop application.

Typical build command:

```bash
npm run build
```

The generated application can then be distributed and installed on supported desktop systems.

---

## 🔄 Application Workflow

```text
                    ┌─────────────────┐
                    │   Desktop App   │
                    │   Electron.js   │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │    Frontend     │
                    │ HTML / CSS / JS │
                    └────────┬────────┘
                             │
                       HTTP / API
                             │
                             ▼
                    ┌─────────────────┐
                    │ Backend Server  │
                    │ Node.js/Express │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │ MySQL Database  │
                    └─────────────────┘
```

---

## 📖 How It Works

### Add a Book

1. Open **The Shelf** application.
2. Click **+ Add a Book**.
3. Enter:

   * Book Title
   * Author
   * Cover Image URL or upload an image
   * Rating
   * Review
4. Click **Shelve It**.
5. The book information is saved and displayed on your digital bookshelf.

---

### 🔍 Search Books

Use the search bar to instantly find books by:

* Title
* Author

---

### 📂 Sort Books

Choose one of the available sorting options:

* Recently Added
* Title A–Z
* Author A–Z
* Highest Rated

---

### 📄 View Book Details

Click on a book to open a detailed catalog-style view containing:

* Book Cover
* Title
* Author
* Rating
* Review

---

### ✏️ Edit and Delete

Users can manage their collection by:

* Editing existing book information
* Updating ratings or reviews
* Deleting books that are no longer needed

All changes are synchronized with the application's data storage.

---

## 📚 Concepts Practiced

This project demonstrates practical knowledge of:

### Frontend Development

* HTML Semantic Elements
* CSS Flexbox
* CSS Grid
* Responsive Web Design
* DOM Manipulation
* Event Handling
* Form Validation
* Modal Windows
* Dynamic Content Rendering
* Image Preview

### JavaScript

* Arrays and Objects
* Functions
* Event Listeners
* Searching Algorithms
* Sorting Data
* CRUD Operations
* Asynchronous Programming
* API Communication

### Backend Development

* Node.js
* Express.js
* REST APIs
* Middleware
* Environment Variables
* Database Connectivity

### Database

* MySQL
* Database Design
* SQL Queries
* CRUD Operations
* Persistent Data Storage

### Desktop Development

* Electron.js
* Desktop Application Architecture
* Native Application Windows
* Integrating Web Technologies into Desktop Applications
* Application Packaging and Distribution

---

## 🔮 Future Improvements

Possible future features include:

* 👤 User authentication and multiple accounts
* 🔐 Secure password authentication
* 📚 Reading status:

  * Read
  * Currently Reading
  * Want to Read
* 🏷️ Book categories and genres
* ❤️ Favorite books section
* 📅 Reading progress tracker
* 📊 Reading statistics dashboard
* 🌙 Dark/Light mode
* 🔖 Bookmark feature
* 📤 Export and import library data
* ☁️ Cloud database synchronization
* 🔎 Advanced filtering
* 📱 Mobile application version
* 🖥️ Additional desktop platform support
* 🔄 Automatic updates for the desktop application

---

## 👨‍💻 Author

**Tithy**

Created as a full-stack software development project to practice modern web technologies, backend development, database integration, and desktop application development.

The project began as a **frontend personal library application** and was later expanded with a **backend server, MySQL database integration, Electron.js, and desktop application functionality**.

---

## 🤝 Contributing

Contributions are welcome!

Feel free to:

1. Fork the repository.
2. Create a new branch.
3. Improve the application.
4. Fix bugs or add features.
5. Submit a pull request.

---

## 📄 License

This project is open-source and intended for **educational and learning purposes**.

---

### ⭐ If you found this project useful, consider giving it a star on GitHub!

**Built with ❤️ using HTML, CSS, JavaScript, Node.js, MySQL, and Electron.js.**
