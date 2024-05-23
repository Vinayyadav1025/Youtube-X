# Youtube-X

### This is modeling of Mongoose database on [stackblitz](https://stackblitz.com/)

-[Model Link](https://stackblitz.com/edit/stackblitz-starters-lgunvf?file=models%2Fhospital-management%2Fhospital.models.js)

# Summary of this project

 This project is a complex backend project that is built with nodejs, expressjs, mongodb, mongoose, jwt, bcrypt, and many more. This project is a complete backend project that has all the features that a backend project should have. We are building a complete video hosting website similar to youtube with all the features like login, signup, upload video, like, dislike, comment, reply, subscribe, unsubscribe, and many more.

Project uses all standard practices like JWT, bcrypt, access tokens, refresh Tokens and many more. We have spent a lot of time in building this project and we are sure that you will learn a lot from this project.



## Installation Process

### Prerequisites

Before you begin, ensure you have the following installed on your machine:

- Node.js (v12 or higher)
- npm
- MongoDB (Running locally or on a cloud service like MongoDB Atlas)
- Cloudinary account

### Steps

1. **Clone the repository**

    ```bash
    git clone https://github.com/Vinayyadav1025/Youtube-X
    cd youtube-X
    ```

2. **Install dependencies**

    ```bash
    npm install
    ```

3. **Set up environment variables**

    Create a `.env` file in the root directory and add your environment variables. for refrence I have added a `.env.sample` file. You can use the following template:

    ```env
    PORT=your_port
    MONGO_URI=your_mongodb_uri
    CORS_ORIGIN  = *
    ACCESS_TOKEN_SECRET = use your token like ejnfkifhddmKJHJGN97ukJYwudh
    ACCESS_TOKEN_EXPIRY=1d
    REFRESH_TOKEN_SECRET=use your token like ejnfkifhddmKJHJGN97ukJYwudh
    REFRESH_TOKEN_EXPIRY=10d 10Day
    CLOUDINARY_CLOUD_NAME=your cloudinary name
    CLOUDINARY_API_KEY=api key
    CLOUDINARY_API_SECRET=secret key
    ```

    Replace the placeholders with your actual values.

4. **Run the application**

    Start the development server using the following command:

    ```bash
    npm run dev
    ```

    The server will start, and you should see output indicating that it is running on the specified port.

5. **Test the APIs**

    Use Postman to test the various APIs. Import the Postman collection (if available) or manually create requests to interact with the server.

## Usage
### Server url :- http://localhost:8000/api/v1/user
### Register
- Register a new user by sending a `post` request to `/register` with the necessary user details.
### Login
- Login a user by sending a `post` request to `/login` with the necessary user details.
### Logout
- Logout user using `post` request to `/logout`.
### Refresh-token
- Use refresh token for not every time take login details with `post` request to `/refresh-token` .
### Change-password
- Hit api endpoint using `patch` request for change password `/change-password`.
### Current-user
- Retrive current user data using `get` request to `/current-user`.
### Update-account
- Update account details using `patch` request to `/update-account`.
### Avatar
- Add avatar on profile using `patch` request to `/avatar`.
### Cover-image
- Add cover image using `patch` request to `/cover-image` endpoint.
### Username
- Retrive user details using `get` request to `/c/username` and use required fields.
### History
- Get user watch history using `get` request to `/history`.


# More features will add in future.

## Contributing

1. Fork the repository
2. Create a new branch (`git checkout -b feature-branch`)
3. Make your changes
4. Commit your changes (`git commit -m 'Add some feature'`)
5. Push to the branch (`git push origin feature-branch`)
6. Open a Pull Request



## Contact

For any queries, please reach out to me on:

- [Twitter](https://x.com/VinayYadav65887?t=s2SHwOPnfnmsa9wCsEUy3w&s=09)
- [LinkedIn](https://www.linkedin.com/in/vinay-yadav-6782a7186/)

# Special Thanks to [@hiteshchoudhary](https://github.com/hiteshchoudhary) and [@chaiaurcode](https://twitter.com/chaiaurcode)
