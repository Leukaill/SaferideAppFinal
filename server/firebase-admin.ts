import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

// Firebase Admin configuration using direct values
const serviceAccount = {
  type: "service_account",
  project_id: "memechat2-52017",
  private_key_id: "f1be2f99f2822a2221e265f3641ae6d0f8fb7539",
  private_key: "-----BEGIN PRIVATE KEY-----\nMIIEvwIBADANBgkqhkiG9w0BAQEFAASCBKkwggSlAgEAAoIBAQDJyrbXfZfD/pOo\ngVKECte4vsrcUQjWxcne+E4j9HsbNXRB7Rswsvup1M9Wv7C+DM3YOjqvfUCMPrme\n5fmRogEDCQTE++S8PLCEih1ZhWBynDqFIhWehTgKu7zGX+O7mLCuaF0sponwk8sj\nJLa3NqBQHEDROyfiYd1+Pdg9wYL++7u1qJqYLV7P50CkIG1TqdjSV8cLr3aIPaoo\nrZ/7Usnk4ESOVQ9CkdWDWVZmZzIfLJr6rWX6YJr+Q2M//HI4gP49gGUqCvOkSjzM\neJ4g/fTa5ErJeYM12FqJGzlWtrKYXMhb3TOfujfUyGSSWJ4+2g7nQodSGwAdtErR\nz3JJwJNDAgMBAAECggEAYDehYTTIdbLgkzs+rilBXR5CkQE4aUqCuOHVFu1lrFH7\n7UClD7Bq3FEKiMzr2f0J8N2zIwBEFjO0VZb+w8kkBvvP4L5nGk4O9c3qDzlLr5J5\nxKC1vZeF3sLrRJzGKbU5fJh0g9QqP2L8pKkT3cCcHmqFn1FhE+9V7/nwX3jJpG2K\n4L8n9VzqF4cM1dJjH6rq2fYcOg5QpLq1l8hWx7Zc5HQkGj4qAjPfBP4lq8Kz3lm1\nz7z8E1q9cPjNgU4nLb6U6yHjGnq7f0JpZkOjqF3lE4sJ9LqKsF3rUh9yZy7zcQfI\n2hc1N9Z3vT2P4M3jX9KgQ2V0oB7lOVcC6+2RLmyPJQKBgQDyVkA1V8PqJwxDv9C5\nzr3bKFnX7Z2k5M9JlHx8/0QQ4xZfN1kEp1q4j8nL6/6OZFpDzl7UyF5Q4k0f8p3H\n5dPFl2B9n0j7nv6F0m3J4hKRn6B4k2P6LzGUE0z4gJ9xDcMcN8zV8qKz+Bw5lzU6\nfH4B0gHzDq9lU5pOr0zCgI3YJwKBgQDVy1JtRQ2Qk+Q4h5L0Y4F5n3z1nF5v0U7C\n8m5N+5hR4M2mNlL0p8Qg1zq7LXn3+U4KgH6V8jV3N1m5K1k+fJ8N4kNn4P7PzDzV\n2cR5+vLzk9l4J3kH7F8RqJ5kU5qI4gKQZf1U0n+QqR6yF8Bj1V2Vl4mZNzPfL1nL\njwKBgQCSz3h4Y5FpfE1VvYV7zNq6nF4f0LvK4Q8T1gG5jH9RjJqN2k9G2p7k8FQ9\nO5p0lJ5r3M1nK9v4L5vZ1z3GkKzF3j8n7zT9mHlJ5+N3B2vQcPQhJ7kJxJgH3Qk2\n5l9T5VgF2qC0d2YpK1bBzN7K4Y5n1F5vUjfZ0v3nJ1z8f4wJyQKBgQCzF1RjK7j9\nP4V4K7qF7Y3V5f0F8z1vL2kN6J2r3K8yK3hN8L7vZ5L0k4nB4kH7F2P1y9V4Y2L8\nt4J5n3z8Z1fN8kH2kL7j4Y5f1V2Vp0L3K6F4H8L7V5f4k2P0L1V9z3Y7fN2P5kJ8\nz1V2L3K6F4H8L7V5f4k2P0L1V9z3Y7fN2P5kJwKBgQD2k3F7Y8V4K7qF7Y3V5f0F\n8z1vL2kN6J2r3K8yK3hN8L7vZ5L0k4nB4kH7F2P1y9V4Y2L8t4J5n3z8Z1fN8kH2\nkL7j4Y5f1V2Vp0L3K6F4H8L7V5f4k2P0L1V9z3Y7fN2P5kJ8z1V2L3K6F4H8L7V5\nf4k2P0L1V9z3Y7fN2P5kJw==\n-----END PRIVATE KEY-----",
  client_email: "firebase-adminsdk-j9qlg@memechat2-52017.iam.gserviceaccount.com",
  client_id: "112614848176048210969",
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-j9qlg%40memechat2-52017.iam.gserviceaccount.com",
  universe_domain: "googleapis.com"
};

// Initialize Firebase Admin (only if not already initialized)
let adminApp;
if (getApps().length === 0) {
  adminApp = initializeApp({
    credential: cert(serviceAccount as any),
    databaseURL: "https://memechat2-52017-default-rtdb.firebaseio.com"
  });
} else {
  adminApp = getApps()[0];
}

export const adminDb = getFirestore(adminApp);
export const adminAuth = getAuth(adminApp);

export { adminApp };