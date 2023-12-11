import { middyfy, MiddyfyHandler } from "./middyfy";
import type { FromSchema } from "json-schema-to-ts";

const queryStringSchema = {
  type: "object",
  required: ["age"],
  properties: {
    age: {
      type: "number",
      enum: [25],
    },
    dd: {
      type: "number",
    },
    gg: {
      type: "string",
      minLength: 2,
      maxLength: 4,
    },
  },
} as const;

const eventSchema = {
  type: "object",
  required: ["queryStringParameters"],
  properties: {
    queryStringParameters: queryStringSchema,
  },
} as const;

const responseBodySchema = {
  type: "object",
  required: ["age"],
  properties: {
    age: {
      type: "number",
    },
  },
} as const;

const lambdaHandler: MiddyfyHandler<
  FromSchema<typeof queryStringSchema>,
  void,
  FromSchema<typeof queryStringSchema>,
  FromSchema<typeof responseBodySchema>
> = async (event) => {
  const { age } = event.queryStringParameters;

  return {
    statusCode: 200,
    body: { age },
  };
};

export const handler = middyfy(lambdaHandler, eventSchema);
