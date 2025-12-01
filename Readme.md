<h2 align="center">Trackist 📝<h2/>

<div align="center">

[![X Badge](https://img.shields.io/badge/-@eravitw-1ca0f1?style=social&labelColor=red&logo=x&logoColor=black&link=https://x.com/eravitw)](https://x.com/eravitw) &nbsp;
[![Mail Badge](https://img.shields.io/badge/-ravirajbhardwaaj@gmail.com-c0392b?style=flat&labelColor=c0392b&logo=gmail&logoColor=white)](mailto:ravirajbhardwaaj@gmail.com) &nbsp;
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-%23FE5196?logo=conventionalcommits&logoColor=white)](https://conventionalcommits.org) &nbsp;
[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](./LICENSE)


Trackist is a simple, efficient task management tool built to help individuals and small teams organize, track, and complete tasks with ease.
</div>

<h2 align="center"> TECH STACK<h2/>
<p align="center">
  <a href="README.md">
    <img
      src="https://go-skill-icons.vercel.app/api/icons?i=nodejs,express,mongodb,mongoose,jwt,react,tailwind,zustand,reactrouter" alt="tech stack"
    />
  </a>
</p>

<h2 align="center">Installation<h2/>

![DB Design](./assets/images/eraserSchema.svg)
[eraserSchema.txt](./backend/eraserSchema.txt)

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

#### 4. Use the following commands to run the project:

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
