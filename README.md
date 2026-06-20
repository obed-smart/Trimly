# Trimly

Trimly helps you transform long, unwieldy URLs into short, memorable links and gives you detailed insights into how those links perform. It's a straightforward tool that not only makes sharing easier but also provides valuable analytics on clicks, geographic origins, devices used, and more, all without complex setup.

## Description

Trimly is a high-performance URL shortening service designed for developers and users who need reliable link management with robust analytics. This backend service is built with a focus on speed, scalability, and maintainability, offering features like custom short codes, user authentication, and comprehensive click data tracking. It leverages modern asynchronous processing and caching to deliver a smooth experience for both anonymous and authenticated users, ensuring your links are always working efficiently and providing the data you need.

## Installation

To get Trimly up and running on your local machine, follow these steps:

1.  **Clone the Repository**:
    ```bash
    git clone https://github.com/obed-smart/Trimly.git
    cd Trimly
    ```

2.  **Install Dependencies**:
    Install all the required Node.js packages using npm:
    ```bash
    npm install
    ```

3.  **Environment Configuration**:
    Create a `.env` file in the root directory by copying the `.env.example` file.
    ```bash
    cp .env.example .env
    ```
    Then, update the `.env` file with your specific configurations. You'll need:
    *   `DATABASE_URL`: Your MongoDB connection string.
    *   `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD`: Redis server connection details.
    *   `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`: Secrets for JWT tokens.
    *   `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`: Credentials for Google OAuth.
    *   `RESEND_API_KEY`: API key for the Resend email service.
    *   `METRICS_USER`, `METRICS_PASSWORD`: Credentials for accessing the Prometheus metrics endpoint.

4.  **Start the Server**:
    *   **Development**:
        To run the server in development mode with live reloading:
        ```bash
        npm run dev
        ```
    *   **Production**:
        First, build the TypeScript project, then start the server:
        ```bash
        npm run build
        npm start
        ```

The server will start on the port specified in your `.env` file (default is 3000).

## Usage

Once the Trimly server is running, you can interact with it via its API endpoints.

**Creating a Short URL (Anonymous or Authenticated)**

Send a POST request to `/api/v1/urls/shorten` with your original URL. If you're authenticated, the link will be associated with your account. Anonymous users will have a temporary cookie set to track their links.

```bash
curl -X POST -H "Content-Type: application/json" -d '{"originalUrl": "https://www.example.com/very/long/url/that/needs/shortening"}' http://localhost:3000/api/v1/urls/shorten
```

**Redirecting to Original URL**

To visit a shortened URL, simply navigate to `http://localhost:3000/YOUR_SHORT_CODE`. Trimly will redirect you to the original URL and record analytics data.

**Adding a Custom Alias**

You can customize your short link after it's been created (if it's not already set).

```bash
curl -X PATCH -H "Content-Type: application/json" -d '{"customAlias": "my-cool-link"}' http://localhost:3000/api/v1/urls/your-existing-short-code
```

**Accessing Link Analytics**

For authenticated users, you can retrieve detailed analytics for a specific short code by sending GET requests to the analysis endpoints:

*   **Overall Analytics**:
    ```bash
    curl http://localhost:3000/api/v1/analysis/your-short-code
    ```
*   **Top Countries**:
    ```bash
    curl http://localhost:3000/api/v1/analysis/your-short-code/top-countries
    ```
*   **Top Devices**:
    ```bash
    curl http://localhost:3000/api/v1/analysis/your-short-code/top-devices
    ```
*   **Top Browsers**:
    ```bash
    curl http://localhost:3000/api/v1/analysis/your-short-code/top-browsers
    ```
*   **Top Operating Systems**:
    ```bash
    curl http://localhost:3000/api/v1/analysis/your-short-code/top-os
    ```
*   **Top Referrers**:
    ```bash
    curl http://localhost:3000/api/v1/analysis/your-short-code/top-referrers
    ```

**User Authentication**

*   **Register**: `POST /api/v1/auth/register` with `username`, `email`, and `password`.
*   **Login**: `POST /api/v1/auth/login` with `email` and `password`.
*   **Google OAuth**: Initiate login via `GET /api/v1/auth/google`.
*   **Logout**: `POST /api/v1/auth/logout` (requires authentication).

## Features

*   **Dynamic URL Shortening**: Create concise short links for any long URL.
*   **Custom Short Codes**: Personalize your short links with a unique alias.
*   **Comprehensive Analytics**: Track clicks, geographic locations (country, city), device types, browsers, operating systems, and referrers for each shortened URL.
*   **User Authentication**: Secure user accounts with local email/password login and Google OAuth integration.
*   **Rate Limiting**: Protect against abuse with intelligent rate limiting for anonymous and authenticated users.
*   **Background Job Processing**: Utilize BullMQ for offloading tasks like flushing analytics data to the database, sending emails (welcome, password reset, security alerts), and migrating anonymous user links to registered accounts.
*   **Caching**: Implement Redis for fast retrieval of URL redirects and frequently accessed analytics data, significantly improving response times.
*   **Health Checks**: Dedicated endpoints to monitor application and database readiness and liveness.
*   **Prometheus Metrics**: Export application metrics for robust monitoring and observability.
*   **Global Error Handling**: Centralized error management to provide consistent and informative responses.
*   **Input Validation**: Strict schema validation using Zod to ensure data integrity.

## Technologies Used

| Technology         | Description                                                      |
| :----------------- | :--------------------------------------------------------------- |
| **TypeScript**     | Superset of JavaScript for type-safe development.                |
| **Node.js**        | JavaScript runtime for building scalable server-side applications. |
| **Express.js**     | Fast, unopinionated, minimalist web framework for Node.js.       |
| **MongoDB**        | NoSQL database for flexible data storage.                        |
| **Mongoose**       | ODM (Object Data Modeling) library for MongoDB and Node.js.      |
| **Redis**          | In-memory data store for caching and rate limiting.              |
| **BullMQ**         | Robust job queue for Node.js using Redis.                        |
| **Passport.js**    | Authentication middleware for Node.js (Local, JWT, Google OAuth).|
| **Zod**            | TypeScript-first schema declaration and validation library.      |
| **Pino**           | Extremely fast Node.js logger.                                   |
| **Prom-Client**    | Prometheus client for Node.js to expose metrics.                 |
| **Resend**         | Email API for developers to send transactional emails.           |
| **Bcrypt**         | Library for hashing passwords.                                   |
| **JWT**            | JSON Web Tokens for secure authentication.                       |
| **GeoIP-Lite**     | Lightweight GeoIP lookup module.                                 |
| **Nano ID**        | Tiny, secure, URL-friendly unique string ID generator.           |
| **Helmet**         | Secures Express apps by setting various HTTP headers.            |
| **Express Rate Limit** | Basic rate-limiting middleware for Express.js.               |

## Contributing

We welcome contributions to Trimly! If you have suggestions for improvements, new features, or bug fixes, please consider contributing.

To contribute:

1.  **Fork the repository**.
2.  **Create a new branch** for your feature or bug fix: `git checkout -b feature/your-feature-name` or `git checkout -b bugfix/issue-description`.
3.  **Make your changes**, ensuring they adhere to the project's coding style.
4.  **Write clear, concise commit messages**.
5.  **Push your branch** to your forked repository.
6.  **Open a Pull Request** to the main branch of the original repository.
    *   Clearly describe the problem your changes solve and any new features.
    *   Reference any relevant issues.

Please ensure your code passes all tests and linting checks before submitting a pull request.

## License

No explicit license information was found in the project files.
---

[![Readme was generated by Dokugen](https://img.shields.io/badge/Readme%20was%20generated%20by-Dokugen-brightgreen)](https://www.npmjs.com/package/dokugen)