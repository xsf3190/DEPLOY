import crypto from "crypto";

const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
    modulusLength: 2048,
    publicKeyEncoding: {
        type: "pkcs1",
        format: "jwk",
    },
    privateKeyEncoding: {
        type: "pkcs1",
        format: "jwk",
    },
});

console.log("=======");
console.log(JSON.stringify(publicKey));
console.log("=======");
console.log(JSON.stringify(privateKey));