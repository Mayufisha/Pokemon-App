# Pokemon-App

CSTP 1206 Final Group Project

Project: Pokemon App
Project Description
In this project, you will develop a full-stack web application using Node.js, Express.js, MongoDB, and Mongoose. The application will be a Pokemon App with three main components: Login/Logout, Favorite Pokemons, and Timeline.

The primary objectives of this project are:

To build a secure and functional backend API.
To integrate authentication and authorization.
To allow users to manage their favorite Pokemon list.
To track and display user activities.
To ensure a responsive and well-styled frontend.

---

Project Requirements
#### 1. Login/Logout Component

Only logged-in users can browse Pokemons.
Users should log in with an username and password.
A "Remember Me" checkbox should be available.
If login is unsuccessful, a friendly error message should be displayed:
Incorrect password.
Non-existent user.
Logout functionality should be implemented.

#### 2. Favorite Pokemons Component

Users should be able to add Pokemons to their favorite list.
Users should be able to remove Pokemons from their favorite list.
The favorite list should be stored in the database and retrieved when the user logs in.

#### 3. Timeline Component

Users should be able to see a timeline of their recent activities, such as:
Login/logout events.
Adding/removing favorite Pokemons.
The timeline should be stored in the database and dynamically updated.

---

Technical Specifications
Backend
Node.js with Express.js for handling requests.
MongoDB as the database.
Mongoose for database modeling and querying.
Express middleware for request validation and authentication.
Frontend
A simple interface for login/logout, managing favorite Pokemons, and viewing the timeline.
Responsive design using CSS.
 
Evaluation Criteria (Rubric)
| Criteria                                 | Points |
| ---------------------------------------- | ------ |
| Login/Logout Functionality               | 20     |
| Proper authentication and authorization  | 5      | 
| Displaying appropriate error messages    | 5      | 
| "Remember Me" functionality              | 5      |
| Logout implementation                    | 5      |
| Favorite Pokemons Functionality          | 20     |
| Adding and removing Pokemons             | 10     |
| Data persistence with MongoDB            | 10     |
| Timeline Component                       | 20     |
| Displaying login/logout events           | 10     |
| Displaying add/remove favorite events    | 10     |
| Code Quality & Best Practices            | 20     |
| Proper API structure and modular code    | 10     |
| Using Mongoose models effectively        | 10     |
| Styling & Responsiveness                 | 20     |
| CSS Styling for a visually appealing UI  | 10     |
| Responsive design for mobile and desktop | 10     |

Total: 100 points

Notes
You may fetch Pokemon data from the PokeAPI.
You may use any CSS framework or library for styling.
You may use any additional libraries or tools as needed.
You may deploy your project to a hosting platform like render.com.
You may start with arrays or in-memory storage before setting up MongoDB.
