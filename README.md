# Online-Quiz-Portal-Website (MERN)

## Features:
* Working with complex MongoDB, queries, schemas, models.
* Separate User Interfaces for Users, Admins.
* JWT Authentication and Password Hashing.
* Admin can add exams with questions , options and answers.
* Real time updates for all the crud operations in Questions and Exams Module.
* Timer functionality for Exam Sessions.
* Live Result Functionality after writting the exams.
* Storing the results into Mongo DB.
* Separate Reports / Analatics functionality for both Admin and User.
* A leaderboard too for admin only
* A light/dark theme switch
* Questions with multiple correct Answers too

## Tech Stack Used:
#### Front-End:
<img alt="React" src="https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB"/> <img alt="Redux" src="https://img.shields.io/badge/Redux-593D88?style=for-the-badge&logo=redux&logoColor=white"/> <img src="https://img.shields.io/badge/Ant%20Design-0170FE?logo=antdesign&logoColor=fff&style=for-the-badge" alt="Ant Design Badge">

#### Back-End:
<img alt="NodeJS" src="https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white"/> <img alt="ExpressJS" src="https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white"/> <img alt="Mongoose" src ="https://img.shields.io/badge/Mongoose-orange?style=for-the-badge&logo=mongodb&logoColor=white"/> <img alt="JWT" src ="https://img.shields.io/badge/JWT-red?style=for-the-badge&logo=JSON+Web+Tokens&logoColor=white"/> 

#### Database:
<img alt="MongoDB" src ="https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white"/>

## Project Structure
quiz-app/ ├── frontend/ # React app ├── backend/ # Node.js backend ├── package.json # Monorepo root package.json (for workspaces) └── README.md # This file

## Installation

### Step 1: Clone the repository

```bash
git clone https://github.com/Prabhat2912/Quiz-app.git
cd quiz-app
```
### Step 2: Install dependencies
This project uses npm workspaces. To install dependencies for both frontend and backend, run:

```bash
npm install
```
This will install all dependencies for both the frontend and backend workspaces.
 
### Step 3: Set up environment variables
Create a .env file in the backend/ directory and add the following environment variables:
```bash
PORT=5000
MONGO_URI=your-mongodb-uri
JWT_SECRET=your-jwt-secret
```
In the frontend/ directory, create a .env file with the following:
```bash
REACT_APP_API_URL=http://localhost:5000/api
```
### Step 4: Run the application
Use the following command to start both the frontend and backend together:

```bash
npm run start
```
This will:

Start the frontend React app at http://localhost:3000
Start the backend Node.js server at http://localhost:5000
### Step 5: Access the app
Go to http://localhost:3000 to access the homepage.
Admin users can access the admin panel from /admin.
Regular users can log in and take quizzes.

