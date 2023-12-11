import type {
  APIGatewayProxyEvent,
  APIGatewayProxyEventMultiValueQueryStringParameters,
  APIGatewayProxyResult,
  Handler,
} from "aws-lambda";
import middy from "@middy/core";
import httpHeaderNormalizer from "@middy/http-header-normalizer";
import httpResponseSerializer from "@middy/http-response-serializer";
import httpErrorHandler from "@middy/http-error-handler";
import httpJsonBodyParser from "@middy/http-json-body-parser";
import httpEventNormalizer from "@middy/http-event-normalizer";
import validator from "@middy/validator";
import { transpileSchema } from "@middy/validator/transpile";
import cors from "@middy/http-cors";
import validateErrorHandler from "./validateErrorHandler";

/**
 * APIGatewayProxyEvent の型を JSON Schema の型で拡張する
 */
export interface LambdaEvent<
  TEventBody,
  TPathParameters,
  TQueryStringParameters
> extends Omit<
    APIGatewayProxyEvent,
    "body" | "pathParameters" | "queryStringParameters"
  > {
  body: TEventBody;
  pathParameters: TPathParameters;
  queryStringParameters: TQueryStringParameters;
  multiValueQueryStringParameters: NonNullable<APIGatewayProxyEventMultiValueQueryStringParameters>;
}

/**
 * APIGatewayProxyResult の型を JSON Schema の型で拡張する
 */
export interface LambdaResult<TResponseBody>
  extends Omit<APIGatewayProxyResult, "body"> {
  body: TResponseBody;
}

/**
 * Lambda Handler の Event, Result の型を JSON Schema の型で拡張する
 */
export type MiddyfyHandler<
  TEventBody = void,
  TPathParameters = void,
  TQueryStringParameters = void,
  TResponseBody = void
> = Handler<
  LambdaEvent<TEventBody, TPathParameters, TQueryStringParameters>,
  LambdaResult<TResponseBody>
>;

/**
 * JSONでレスポンスするmiddyのラップ関数
 */
export const middyfy = <
  TEventBody,
  TPathParameters,
  TQueryStringParameters,
  TResponseBody
>(
  handler: MiddyfyHandler<
    TEventBody,
    TPathParameters,
    TQueryStringParameters,
    TResponseBody
  >,
  eventSchema: Record<string, unknown> | null = null
) => {
  const wrapper = middy()
    // .use(httpErrorHandler({ fallbackMessage: "ddd" }))
    .use(validateErrorHandler())
    .use(httpHeaderNormalizer())
    .use(httpJsonBodyParser({ disableContentTypeError: true }))
    .use(httpEventNormalizer())
    .use(cors())
    .use(
      httpResponseSerializer({
        serializers: [
          {
            regex: /^application\/json$/,
            serializer: ({ body }) => JSON.stringify(body),
          },
        ],
        defaultContentType: "application/json",
      })
    );

  if (eventSchema) {
    wrapper.use(
      validator({
        eventSchema: transpileSchema(eventSchema, {}),
      })
    );
  }

  return wrapper.handler(handler);
};
