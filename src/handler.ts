import { middyfy, MiddyfyHandler } from "./middyfy";
import type { FromSchema } from "json-schema-to-ts";

const eventBodySchema = {
  type: "object",
  properties: {
    accountName: {
      type: "string",
      minLength: 10,
      maxLength: 50,
      pattern: "nt.*",
    },
    email: {
      type: "string",
      minLength: 2,
      maxLength: 4,
    },
  },
  required: ["accountName", "email"],
} as const;

const eventSchema = {
  type: "object",
  properties: {
    body: eventBodySchema,
  },
} as const;

const queryStringSchema = {
  type: "object",
  required: ["age"],
  properties: {
    age: {
      type: "number",
    },
  },
} as const;

const responseBodySchema = {
  type: "object",
  required: ["email"],
  properties: {
    email: {
      type: "string",
    },
    age: {
      type: "number",
    },
  },
} as const;

const lambdaHandler: MiddyfyHandler<
  FromSchema<typeof eventBodySchema>,
  void,
  FromSchema<typeof queryStringSchema>,
  FromSchema<typeof responseBodySchema>
> = async (event) => {
  const { email } = event.body;
  const { age } = event.queryStringParameters;

  return {
    statusCode: 200,
    body: { email, age },
  };
};

export const handler = middyfy(lambdaHandler, eventSchema);
