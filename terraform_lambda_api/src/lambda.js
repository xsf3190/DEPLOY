import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

const sesClient = new SESClient({ region: "eu-central-1" });

var response = {
  "statusCode": 200,
  "headers": {
    "Content-Type": "application/json",
  },
  "body": "{ \"result\": \"Send email\"\n}"
}

const errorResponse = (error) => {
  const response = {
    "statusCode": 500,
    "headers": {
      "Content-Type": "application/json",
    },
    "body": `{ \"error\": "${error}" }`
  }
  return response;
}

export const handler = async (event) => {
  try {
  
    const e = JSON.parse(event.body);
    if (!e.contactEmail || !e.body || !e.subject || !e.sourceEmail) {
      return errorResponse("body does not contain the required fields")
    }

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
            Charset: "UTF-8",
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

    return sesClient.send(params).then(() => response).catch((err)=> {
      return errorResponse(err)
    });
  } catch (err) {
    return errorResponse(err);
  }
};
