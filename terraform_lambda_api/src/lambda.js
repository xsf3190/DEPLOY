
import { SESClient } from "@aws-sdk/client-ses";
const sesClient = new SESClient({ region: "eu-central-1" });
import { SendEmailCommand } from "@aws-sdk/client-ses";
import crypto from "crypto";

var response = {
  "statusCode": 200,
  "headers": {
    "Content-Type": "application/json",
  },
  "body": "{ \"result\": \"Send email\"\n}"
}

const pKey = crypto.createPublicKey({
  key: Buffer.from(process.env.PUBLIC_KEY, "base64").toString(),
  format: "pem",
  type: "pkcs1"
});

export const handler = async (event) => {

  if (event.body?.length > 550) throw new Error("bad request");

  const e = JSON.parse(event.body);
  if (!e.name || !e.email || !e.message || !e.contactEmail || !e.signatureContactEmail) throw new Error("bad request");

  const algorithm = "SHA256";
  const eBuf = Buffer.from(e.contactEmail);
  const sBuf = Buffer.from(e.signatureContactEmail, "base64");
  if (!crypto.verify(algorithm, eBuf, pKey, sBuf)) throw new Error("bad request");

  const params = new SendEmailCommand({
    Destination: {
      CcAddresses: [
      ],
      ToAddresses: [
        e.contactEmail,
      ],
    },
    Message: {
      Body: {
        Text: {
          Charset: "UTF-8",
          Data: `Dear User,\n\nYou got a new message:\n\n - Name: ${e.name}\n - Email: ${e.email}\n\n\n----- Start Message -----\n\n${e.message}\n\n\n\n ------ End Message ------\n\n Kind Regards,\n\nFlorent`,
        },
      },
      Subject: {
        Charset: "UTF-8",
        Data: process.env.SUBJECT || "No subject defined",
      },
    },
    Source: process.env.FROM_EMAIL,
    ReplyToAddresses: [
    ],
  });

  try {
    return sesClient.send(params).then(() => response);
  } catch (err) {
    console.log(err)
    return err;
  }
};