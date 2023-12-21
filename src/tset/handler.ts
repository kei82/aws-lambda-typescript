import { readFileSync } from "fs";

export const eventBodySchema = {
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
console.log(readFileSync(__dirname + "/body.json"));
console.log(readFileSync(__dirname + "/body.json"));
