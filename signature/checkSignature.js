import crypto from "crypto";

const algorithm = "SHA256";

const publicKey = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAqrj5QZsQKmrn5gA5o7qp
DvlrASzl/8RXk10HlYzy4s69C9E3Pya5Igi0upxlgb2bvR8S9y6JZLJ0VJGLmGK1
Dh5BhDBza82+JUuodGJ8ropasMPVJbomjqUQSRXtNpZkzcD9LFFeJAEsY5n0kFI0
/4eixC1CvpRTiE8aP2sUpEwZ0GPEST9Gg7J5PxXS1jAWZkkkLhKOR9iVL9lXFFGo
dTNYtXB/V4+Zl7DEgtpaKRPbBUI+PJc0Y//RaiXtPCWalL4OH/JgNZCGpJUEEI8Y
Pm1am0JZY0Gs716oEE+B31jpDl36nmxKKp4Ea6RFeffvUAoT/34W1KbooTFGOIcz
EwIDAQAB
-----END PUBLIC KEY-----`;

const email = "mark.russellbrown@gmail.com";
console.log(email);

let data = Buffer.from(email);

const pKey = crypto.createPublicKey({
    // key: Buffer.from(publicKey, "base64").toString(),
    key: publicKey,
    format: "pem",
    type: "pkcs1"
});

const signature = `RnnIrpqBfnID0X3TUNwPM9nkDcXZUSNhDda0+rUEFP5+lt4Vgj57tLORd3V9kj6r
YJUfUHXf764ZHmWgtE5YZY+Wb8zx92iR+dGvnaOwru8aO+EofLiysdLbxHlkSb3Q
PQouBFfk9AmW4sOrmAdw0rGb6mzVPdL3qK67/bQwb9Th5eXujMn7zCNRp4wjXuJF
S7Yl4oP7cW0qGehxdlD9fQ0SwTyreyKPSDRDCM5vJGwGdPXuSVlB8Z68aNt9abcM
DU+gEk18RdSTvQL9TM3XJfvDgXsCFz0/rJ2BGJmIq7BPRt6AffmbBeVa0xkR/hJO
G4E3+e1K+ee0ht3Bk9JQUQ==`

let isVerified = crypto.verify(algorithm, data, pKey, Buffer.from(signature, "base64"));

console.log(`Signature verified: ${isVerified}`);