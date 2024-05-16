import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

const sesClient = new SESClient({ region: "eu-central-1" });
const response = {
  "statusCode": 200,
  "headers": {
    "Content-Type": "application/json",
  },
  "body": "{ \"result\": \"Send email\"\n}"
}

export const handler = async (event) => {

  if (event.body?.length > 550) throw new Error("bad request");

  const e = JSON.parse(event.body);
  if (!e.contactEmail || !e.body || !e.subject || !e.sourceEmail) throw new Error("bad request");

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
        Html: {
          Data: e.body,
        }
      },
      Subject: {
        Charset: "UTF-8",
        Data: e.subject,
      },
    },
    Source: e.sourceEmail,
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
