import middy from "@middy/core";
import { APIGatewayProxyEvent } from "aws-lambda";

const lambdaHandler = async (event: APIGatewayProxyEvent) => {
  console.log(event);

  return {
    statusCode: 200,
    body: JSON.stringify({ event }),
  };
};

export const handler = middy().handler(lambdaHandler);
