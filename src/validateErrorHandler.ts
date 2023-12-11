import { APIGatewayProxyEvent } from "aws-lambda";
import type { MiddlewareObj } from "@middy/core";
import type { ErrorObject } from "ajv/dist/core";
import { HttpError } from "http-errors";
import { LambdaResult } from "./middyfy";

type Middleware = MiddlewareObj<
  APIGatewayProxyEvent,
  LambdaResult<Record<string, unknown>>
>;
type RequestError =
  | ({ package: string; data: ErrorObject[] } & HttpError)
  | null;

const middleware = (): Middleware => {
  const onError: Middleware["onError"] = async (request) => {
    const error = request.error as RequestError;
    if (error) {
      request.response = {
        statusCode: error.statusCode,
        body: { message: "error.message" },
      };
    }
  };

  return { onError };
};

export default middleware;
