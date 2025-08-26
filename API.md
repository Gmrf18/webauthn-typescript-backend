# WebAuthn API Documentation

This documentation describes the API endpoints for WebAuthn authentication.

## Endpoints

### 1. Generate Registration Options

Generates a challenge and other options necessary for a client to start the registration process for a new authenticator (device).

- **Endpoint:** `POST /generate-registration-options`
- **Content-Type:** `application/json`

#### Request Body

```json
{
  "username": "string"
}
```

- `username` (string, required): The username to be registered. This name will be associated with the credential.

#### Successful Response (200 OK)

Returns an object with the configuration options that the client-side library (`@simplewebauthn/browser`) needs to call `startRegistration()`.

```json
{
  "rp": {
    "name": "SimpleWebAuthn Example",
    "id": "localhost"
  },
  "user": {
    "id": "user_1678886400000",
    "name": "testuser",
    "displayName": "testuser"
  },
  "challenge": "...", // A long, random string (base64url encoded buffer)
  "pubKeyCredParams": [ ... ],
  "timeout": 60000,
  "attestation": "none",
  "authenticatorSelection": {
    "residentKey": "required",
    "userVerification": "preferred"
  }
}
```

#### Error Responses

- `400 Bad Request`: If the `username` is not provided in the request body.

```json
{
  "error": "Username is required"
}
```

### 2. Verify Registration

Verifies the authenticator's response received on the client during the registration process. If the verification is successful, the new credential is saved to the database.

- **Endpoint:** `POST /verify-registration`
- **Content-Type:** `application/json`

#### Request Body

```json
{
  "username": "string",
  "response": { ... } // The response object from startRegistration()
}
```

- `username` (string, required): The username associated with the registration.
- `response` (object, required): The JSON object returned by the `startRegistration()` function from the `@simplewebauthn/browser` library.

#### Successful Response (200 OK)

```json
{
  "verified": true
}
```

#### Error Responses

- `400 Bad Request`: If the verification fails or if no challenge is found for the user.
- `404 Not Found`: If the user is not found.
- `500 Internal Server Error`: If an unexpected error occurs during verification.

### 3. Generate Authentication Options

Generates a challenge for a previously registered user to log in.

- **Endpoint:** `POST /generate-login-options`
- **Content-Type:** `application/json`

#### Request Body

```json
{
  "username": "string"
}
```

- `username` (string, required): The name of the user trying to log in.

#### Successful Response (200 OK)

Returns an object with the options that the client-side library needs to call `startAuthentication()`.

```json
{
  "challenge": "...", // A new challenge (base64url encoded buffer)
  "allowCredentials": [ ... ],
  "timeout": 60000,
  "userVerification": "preferred",
  "rpId": "localhost"
}
```

#### Error Responses

- `404 Not Found`: If the user is not found.

### 4. Verify Authentication

Verifies the authenticator's response during the login process.

- **Endpoint:** `POST /verify-login`
- **Content-Type:** `application/json`

#### Request Body

```json
{
  "username": "string",
  "response": { ... } // The response object from startAuthentication()
}
```

- `username` (string, required): The name of the user.
- `response` (object, required): The JSON object returned by the `startAuthentication()` function from the `@simplewebauthn/browser` library.

#### Successful Response (200 OK)

```json
{
  "verified": true
}
```

#### Error Responses

- `400 Bad Request`: If the verification fails.
- `404 Not Found`: If the user or credential is not found.
- `500 Internal Server Error`: If an unexpected error occurs.