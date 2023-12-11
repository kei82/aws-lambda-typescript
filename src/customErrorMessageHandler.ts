import { APIGatewayProxyEvent } from "aws-lambda";
import type { MiddlewareObj } from "@middy/core";
import type { ErrorObject } from "ajv/dist/core";
import { HttpError } from "http-errors";
import { LambdaResult } from "./middyfy";

type Middleware = MiddlewareObj<
  APIGatewayProxyEvent,
  LambdaResult<ErrorMessage[] | null>
>;

type ErrorMessage = {
  errorCode: string;
  errorMessage: string;
  key?: Record<string, unknown>[];
};

interface MiddyError extends HttpError {
  cause: { package: string; data: ErrorObject[] } | undefined;
}

const middleware = (): Middleware => {
  const onError: Middleware["onError"] = async (request) => {
    const error = request.error as MiddyError;

    if (error?.cause?.package === "@middy/validator") {
      request.response = {
        statusCode: error.statusCode,
        body: error.cause.data.map((i) => {
          return {
            errorCode: i.keyword,
            errorMessage: i.message ?? "Unknown Error",
          };
        }),
      };
      return;
    }

    request.response = {
      statusCode: 500,
      body: null,
    };
  };

  return { onError };
};

export default middleware;
