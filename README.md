# Ignite - Freelance Collaboration Platform

Ignite is a full-stack web application built with the MERN stack (MongoDB, Express.js, React, Node.js). It's a platform designed to connect clients with freelance developers for group-based projects. It features role-based user authentication, project posting, applicant management, task tracking, and a work submission/review system. Media and image uploads are handled by Cloudinary.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [Environment Variables](#environment-variables)
- [API Endpoints](#api-endpoints)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

## Features

Based on the project dependencies, here are some of the core features:

- **User Authentication**: Secure user login and registration using JSON Web Tokens (JWT).
- **RESTful API**: A robust backend API built with Node.js and Express.js.
- **Database**: MongoDB is used as the database for storing application data.
- **Cloud Media Storage**: File uploads are handled and stored using Cloudinary.
- **Dynamic Frontend**: A responsive and interactive user interface built with React.
- **Immutable State Management**: Predictable state management in React using Immer.

## Tech Stack

| Category      | Technology                                                                                             |
|---------------|--------------------------------------------------------------------------------------------------------|
| **Frontend**  | [React](https://reactjs.org/), [Tailwind CSS](https://tailwindcss.com/),[Framer-Motion](https://www.npmjs.com/package/framer-motion),[Lucide](https://lucide.dev/),[jwt-decode](https://www.npmjs.com/package/jwt-decode) |
| **Backend**   | [Node.js](https://nodejs.org/), [Express.js](https://expressjs.com/), [MongoDB](https://www.mongodb.com/), [Cloudinary](https://cloudinary.com/) |
| **Dev Tools** | [ESLint](https://eslint.org/), [esbuild](https://esbuild.github.io/),[PostMan](https://www.postman.com/), |

## Project Structure

The project is organized into two main directories:

-   `frontend/`: Contains the React client-side application.
-   `backend/`: Contains the Node.js/Express server-side application and API logic.

## Prerequisites

Before you begin, ensure you have the following installed:

-   Node.js (v14.x or later recommended)
-   `npm` or `yarn`
-   A running MongoDB instance (local or cloud-based like MongoDB Atlas)
-   A Cloudinary account for API keys.

## Getting Started

Follow these instructions to get the project up and running on your local machine.

1.  **Clone the repository:**
    ```sh
    git clone <your-repository-url>
    cd "Main Project - Copy"
    ```

### Backend Setup

2.  **Navigate to the backend directory and install dependencies:**
    ```sh
    cd backend
    npm install
    ```

3.  **Create an environment file:**
    Create a `.env` file in the `backend` directory and add the necessary environment variables. See the Environment Variables section for details.

4.  **Start the backend server:**
    ```sh
    # For production
    npm start

    # For development with auto-reloading
    npm run dev 
    ```
    The server should now be running, typically on a port like `5000` or `8000`.

### Frontend Setup

5.  **Navigate to the frontend directory and install dependencies:**
    ```sh
    cd ../frontend
    npm install
    ```

6.  **Create an environment file:**
    The frontend likely needs to know the URL of your backend API. Create a `.env` file in the `frontend` directory:
    ```env
    VITE_API_URL=http://localhost:5000/api
    ```
    *(Adjust the port if your backend is configured differently. For Vite, the prefix must be `VITE_`.)*

7.  **Start the frontend development server:**
    ```sh
    npm run dev
    ```
    The React application will open in your browser, usually at `http://localhost:3000`.

## Environment Variables

The backend requires the following environment variables to be set in a `.env` file in the `/backend` directory.

```env
# MongoDB Connection
MONGO_URI=mongodb://localhost:27017/your_db_name

# JWT Secret for token signing
JWT_SECRET=your_super_secret_key

# Cloudinary Credentials
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## Contributing

Contributions are welcome! Please feel free to open an issue or submit a pull request.

## License

This project is not currently licensed. Consider adding an open-source license like MIT.
