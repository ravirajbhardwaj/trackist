# 📝 Trackist

**Trackist** is a simple, efficient task management tool built to help individuals and small teams organize, track, and complete tasks with ease.

---

## 🛠️ Tech Stack
[![Node.js](https://img.shields.io/badge/Node.js-43853D.svg?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-000000.svg?logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/-MongoDB-13aa52?style=for-the-badge&logo=mongodb&logoColor=white)]()
[![Mongoose](https://img.shields.io/badge/Made_with-Mongoose-880000?&logo=mongodb)]()
[![Cloudinary](https://img.shields.io/badge/Cloudinary-3448C5.svg?logo=cloudinary&logoColor=white)](https://cloudinary.com/)
[![Nodemailer](https://img.shields.io/badge/Nodemailer-3B82F6.svg?logo=nodemailer&logoColor=white)](https://nodemailer.com/)
[![JWT](https://img.shields.io/badge/JWT-000000.svg?logo=jsonwebtokens&logoColor=white)](https://jwt.io/)
[![React](https://img.shields.io/badge/-ReactJs-61DAFB?logo=react&logoColor=white&style=for-the-badge)]()
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)]()
[![Zustand](https://img.shields.io/badge/zustand-602c3c?style=for-the-badge&logo=data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA4AAAAOCAMAAAAolt3jAAAA8FBMVEVHcExXQzpKQDlFV16lpqyGh4tPPTdWT0weHRU7LRZGQzmxYjlaTkZsbmywVyxtXDSFhISXm6WWpcaytb6bm56gprY0LiiXmp2prLamsMa0XS42MSxkTUVDSkuyYzGihXdDV2GprbmedVxaRD1kTUWUdGFGOCN4a2OfpbI0SFFAMSddTkbCc0dWQiGFRypXQyJUQCBcTTWviDVXQyJcUDjlqCWxjkG+hBTiohtURD6lr8lORTtDVVZmPyxwSipaRSJDOzaWpsyYqMyYqM2dq8tPOjBERTs6QUKTcCeKaCJvViZdSDK4iSngoiDvqx7KkRuGEi1hAAAAOXRSTlMApZ78cB8hCAMQO/j/FOH4KlT1wFfJTjaY6SxtVexFn3Tn2sN6d671mVuJ+/PPN9CT6TfpS4C9jJaVLRihAAAAi0lEQVQIHXXBxRKCUAAF0Es/QMDubsVuGrv1///GBQ4bx3PwgwC8gFCRohs8QrQV0ZtKOZ9JcgBmU8MwqFa9kjNTUWB58f2jPOjU9juTBTbPq+vIar972MZjwPr1uDvqCFw2wQpQVm/t7Oo9gAgAFtrtZNtMFQFp7nkWU5IQECfjYbuQFvBFRJHgjw9L0A80UmaGpAAAAABJRU5ErkJggg==)]()
 
## 🏁 Installation

## Models

Schema: [eraserSchema.txt](./backend/eraserSchema.txt)

![DB Design](./assets/images/eraserSchema.svg)

### 2. Install dependencies

0. **Prerequisites**

Make sure you have the following installed on your machine:

- [Git](https://git-scm.com/)
- [Node.js](https://nodejs.org/en)
- [npm](https://www.npmjs.com/) (Node Package Manager)

1. **Clone the repository:**

```bash
  git clone https://github.com/ravirajbhardwaj/trackist.git
```

2. **Navigate to the project directory:**

```bash
cd trackist
npm install
```

### 3. Set up environment variables

Create `.env` files in the server and client folder and copy paste the content of `.env.sample`

```bash
# server side
cd backend
cp .env.eample .env # then update `.env` with your creadentials.
cd ..

# client side
cd frontend
cp .env.emaple .env # then update `.env` if required.
cd ..
```

---

This project requires setting up environment variables and generating key pairs for authentication.

1. Create a `secrets` directory at the root of the project:

```bash
mkdir secrets
```

---

2. Inside the `secrets` directory, create two files:

- `private.pem`: This will store the private key.
- `public.pem`: This will store the public key.

3. Generate a public and private key pair. You can use the following command to generate them:

✅ 1. Generate Private Key (private.pem)

```bash
openssl genpkey -algorithm RSA -out private.pem -pkeyopt rsa_keygen_bits:2048
```

- -algorithm RSA → We are using RSA algorithm.
- rsa_keygen_bits:2048 → Sets key size to 2048 bits (standard secure size).
- This generates `private.pem`.
- The private key is used to sign the JWTs, ensuring that only the server can create valid tokens.
- The private key should be kept secret and secure, as it is used to sign the JWTs.

✅ 2. Extract Public Key (public.pem) from Private Key

```bash
openssl rsa -pubout -in private.pem -out public.pem
```

- -pubout → Extracts the public key from the private key.
- -in private.pem → Specifies the input file (private key).
- -out public.pem → Specifies the output file (public key).
- This generates `public.pem`.
- The public key is derived from the private key, allowing you to share it without compromising security.
- The private key should be kept secret and secure, while the public key can be shared with anyone who needs to verify the JWTs signed with the private key.
- The public key is used to verify the JWTs, ensuring that they were signed by the server and have not been tampered with.

---

### 4. This section provides instructions to start the database container using Docker Compose.

Prerequisites:

- Ensure Docker and Docker Compose are installed on your system..

Steps to start the database container:

1. Open a terminal or command prompt.
2. Navigate to the directory containing the `compose.yml` file.
3. Run the following command to start the database container in detached mode:

```bash
docker-compose up -d
```

4. Confirm that the container is running by executing:

```bash
docker ps
```

5. To stop the container, use:

```bash
docker-compose down
```

---

#### 5. Use the following commands to run the project:

- **Start the frontend app:**

  ```bash
  cd frontend
  npm install
  npm run dev
  ```

- **Start the backend server:**

  ```bash
  cd ../backend

  npm start
  ```

- **Open app in browser:**

Visit [https://localhost:5173](https://localhost:5173) to access frontent.

- **Explore the API:**

  Access the project APIs at the specified endpoints using [API Docs]().

---

## 🤝&nbsp;&nbsp;Contributing

Contributions are always welcome!

See [CONTRIBUTING.md](./CONTRIBUTING.md) for ways to get started.
</br></br>
