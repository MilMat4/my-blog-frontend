# My Blog

## Run locally

1. Clone the `my-blog-backend` repository alongside this repository.
2. Install dependencies in each repository with `npm install`.
3. In the backend repository, install and start MongoDB locally, or create a MongoDB Atlas database. Copy its `.env.example` to `.env` and configure the values described in the backend README.
4. Start the API with `npm run dev` in the backend repository, then start the frontend with `npm run dev` here.
5. Open the Vite URL printed in the frontend terminal (normally `http://localhost:5173`).

The API connects to MongoDB before it starts listening on port 3000. Vite proxies `/api` and `/uploads` requests to the API. User accounts are stored in MongoDB, passwords are hashed with bcrypt, and login sessions use an HTTP-only cookie. New sign-ups receive a six-digit email verification code through Mailtrap and must verify it before logging in. Codes expire after 10 minutes, allow five attempts, and can be resent after a 60-second cooldown. Check the Mailtrap sandbox inbox to retrieve the code during development.

For production, provide the backend's required environment variables in the server environment. Serve the frontend and API on the same site so the HTTP-only session cookie is sent securely. Configure the frontend host to fall back to `index.html` for app routes such as `/home`, `/my-posts`, and `/admin/users`; API paths must still be handled by the API.

## Posts and user roles

New accounts have the `user` role and can create, view, edit, and delete their own posts. A `superadmin` can also see the user directory, open a user's profile, and manage that user's posts. The API checks the signed-in user's current database role and post ownership for every protected request.

To make an existing account a superadmin, first register it as a normal user, then run `npm run promote:superadmin -- admin@example.com` from the backend repository with the account's email. This command requires `MONGODB_URI` and only promotes an existing account; the public registration endpoint never assigns elevated roles.

The React app uses separate routes: `/` is the public carousel landing page, `/login` is authentication, `/home` shows posts in pages of four, `/posts/:postId` opens a story and records a view, `/my-posts` manages the signed-in user's posts, `/create` is the post composer, and `/posts/:postId/edit` edits a post. The featured-story carousel starts with the most-viewed post and breaks view-count ties by recency. Superadmins can visit `/admin/users` and `/admin/users/:userId/posts` to manage users' posts. Selecting **Explore** on the landing page opens login; authentication is only needed to create or manage posts.

Post images are uploaded with Multer, limited to 5 MB, and accepted only when both the declared type and file signature match JPEG, PNG, WebP, or GIF. Uploaded files are stored by the backend and served from `/uploads/`; this directory is git-ignored and should be persisted/backed up in production (or replaced with object storage when deploying multiple app instances).

## Project structure

- `src/components/` contains the reusable React UI components.
- `src/data/` holds the blog's display data, and `src/services/` contains API communication.
- `src/components/` contains the reusable React UI components, and `src/services/` contains API communication.
- API source code and configuration live in the separate `my-blog-backend` repository.
