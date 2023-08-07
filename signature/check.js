import crypto from "crypto";

const algorithm = "SHA256";

const publicKey = `{"kty":"RSA","n":"0g2GOH27qYAc4WvolXfE-L9tngZsY2EakeXFvWh_JJPluSQfZGLMNMtVmGPc-8hUXO29QcHkWaREi6rPDVG6cRJEMROsxJQnoUN86kx6C7LhtkZYfN6F5j5-SyyIYsrizDDytLkZYRf6BtL0YatNmii98vEf7a9pBqrq_escazChsYZ3P4FIwlVBrui51N0VSxqYCGJ4-Gnyf03HSKYQKDKc9SXzajIpgJgbBZMGkbnu69MEJhpOFx9Ur8x1eHUOoEpF-j-00RTcSlhw2n_P8JsuxDusTTDJhCOMxUwIHlpZTiDcRwVCNFdizIq_IgQu4f5E4e-gBfcnWmyQ2GEUiw","e":"AQAB"}`;
const privateKey = `{"kty":"RSA","n":"0g2GOH27qYAc4WvolXfE-L9tngZsY2EakeXFvWh_JJPluSQfZGLMNMtVmGPc-8hUXO29QcHkWaREi6rPDVG6cRJEMROsxJQnoUN86kx6C7LhtkZYfN6F5j5-SyyIYsrizDDytLkZYRf6BtL0YatNmii98vEf7a9pBqrq_escazChsYZ3P4FIwlVBrui51N0VSxqYCGJ4-Gnyf03HSKYQKDKc9SXzajIpgJgbBZMGkbnu69MEJhpOFx9Ur8x1eHUOoEpF-j-00RTcSlhw2n_P8JsuxDusTTDJhCOMxUwIHlpZTiDcRwVCNFdizIq_IgQu4f5E4e-gBfcnWmyQ2GEUiw","e":"AQAB","d":"GMG6TjcszTtJwXHH7bHk4mfMIiIMrUvZEgAG-x4b-hzU_aoEadRRJW8frVXRH6XKolHs3-6xHLWaf0GdpKq7ctndyqZQfbIegkhjf8k4CzVFRV1AzvrPxPAcT3zgrZAkWepHo3A7eFuXPthR2vRnMY0CvOWZce3zeXM0k20d94NYUiTHhwdMulusYyeQvtJ2VHSzAUsC6QVZuwwKL3uSv0T9sYZ-n64G103bz8k5BK6vOydsBvmI0CmQSeEfaqm_lN3YdNbGilBaPzjlr2NrWMS5WBjgE-a7neNIvMdQXhzRsmLDOvs8o5hU4kLlxgrEOB5eGCXuDlVH0GpPds6HDQ","p":"46SXzP2DN7PSnWE9COAp4oX-yDMr3cHZM8F9HNNo_K2JiXyXweEdxYlKzFZP-EAz9dzAXulqfyINPG00R7mV98CZ_TF8VhPMN64pt5-xbqamU2Q-RKWbM_Ch8uSWNrX4wg2CQr1kcl1-gGzua2J2x6Mx9c99AQS1PXZRDENbcTc","q":"7Df-D0np7IXLVnkwSwjdsX0HGr3A060ej14I4RfPypY_2V8ErIASJas3WhvJY9Gc_7hr7na9Xu8SBksLEyIwcO4JS4SWHh_qIQOut-UAbzEKtflKMkN4z22pGPj5esUA4ZF2JpXCbmIR23oJxjsUW30s5AroLsOLrGY178ivsU0","dp":"j2rd_FbneYuAMIjXlCTuHnm-99BNXavINLQ9J5EFvtNyKD1nus0iHZaOmkfyn_uLAOXwCJvT7X69igle-6Uvl2QvX_XyWKSmb5n5TGd-uLCjbzxjgoo3SrTawxVCkft5WoB6RaPeibLfhPecCemB3eqyCiSLo72clblZ_HjfPmc","dq":"WuJEJp-6l9z2WgPwl74GheZj2F8PlKGz81crtWcS9JAQatLLGo9_6-xPNKUiO_yHGkBbjnky7RawaalvzmHGH30GKH8PvvFqhF9FVs2N-Dn3NAKBEIuzLKO1fr00R48Kgr8TpU7TauLimf3_SryqXXTw06B6qptj3uXIdMRTDLU","qi":"iTQNeGP5tupL4RAaLe4_DG4b8drseFO1rOyGw45Wp-INL8g76fIh4ZLAvYuyQOPc9FtdR_Eu5NLpqODy6YnRdIDG0kUAEOT1-NUlYI7PMbammKM_XxgwP2ntsZvd8JqgbadnJKAcT7QvZpiDi6C41IJwbQltoH8mDMKK3DjXYys"}`;

const email = "mark.russellbrown@gmail.com";
console.log(email);

let data = Buffer.from(email);

const pKey = crypto.createPrivateKey({
    key: JSON.parse(privateKey),
    format: "jwk",
    type: "pkcs1"
});

const pubKey = crypto.createPublicKey({
    key: JSON.parse(publicKey),
    format: "jwk"
});

let signature = crypto.sign(algorithm, data, pKey).toString("base64");

console.log(signature);

let isVerified = crypto.verify(algorithm, data, pubKey, Buffer.from(signature, "base64"));

console.log(`Signature verified: ${isVerified}`);