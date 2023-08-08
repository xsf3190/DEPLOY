import crypto from "crypto";

const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
    modulusLength: 2048,
    publicKeyEncoding: {
        type: "pkcs1",
        format: "pem",
    },
    privateKeyEncoding: {
        type: "pkcs1",
        format: "pem",
    },
});

console.log("=======");
console.log(Buffer.from(publicKey).toString("base64"));
console.log("=======");
console.log(Buffer.from(privateKey).toString("base64"));