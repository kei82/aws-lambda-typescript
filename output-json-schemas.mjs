import fs from "fs-extra/esm";
import path from "path";
import decamelize from "decamelize";
import OpenAPIParser from "@apidevtools/swagger-parser";

const oasParse = await OpenAPIParser.validate("./petstore.yaml");
const deleteProperties = [
  "description",
  "title",
  "xml",
  "default",
  "example",
  "examples",
];

/**
 * 再帰的にオブジェクトのプロパティを消す
 * @param {object} obj
 * @param {string[]} delProps
 */
function recursivePropDelete(obj, delProps) {
  for (const prop in obj) {
    if (obj.hasOwnProperty(prop)) {
      if (delProps.includes(prop)) {
        delete obj[prop];
        continue;
      }
      if (typeof obj[prop] === "object") {
        recursivePropDelete(obj[prop], delProps);
      }
    }
  }
}

/**
 * スキーマオブジェクトをJSONにして出力
 * @param {string} dir
 * @param {string} filename
 * @param {object} obj
 */
function outputJson(dir, filename, obj) {
  if (dir && filename && !Object.keys(obj.properties).length) return;

  recursivePropDelete(obj, deleteProperties);

  filename = path.join(
    dir,
    decamelize(filename, { separator: "-" })
      .replace(/[<>:"\/\\\|\?\*_]/g, "-")
      .replace(/(^-|-&)/g, "") + ".json"
  );

  fs.outputJsonSync(filename, obj, { spaces: 2 });
  console.log("Output: " + filename);
}

/**
 * paths
 */
for (const path in oasParse.paths) {
  for (const method in oasParse.paths[path]) {
    const { parameters, requestBody } = oasParse.paths[path][method];

    /**
     * paths.method.parametersのスキーマ出力
     */
    if (parameters) {
      const queryStringSchema = {
        type: "object",
        required: [],
        properties: {},
      };
      const multiValueQueryStringSchema = {
        type: "object",
        required: [],
        properties: {},
      };
      const pathParameterSchema = {
        type: "object",
        required: [],
        properties: {},
      };

      for (const parameter of parameters) {
        if (parameter.in === "query") {
          if (parameter.schema.type === "array") {
            multiValueQueryStringSchema.properties[parameter.name] =
              parameter.schema;
            if (parameter.required) {
              multiValueQueryStringSchema.required.push(parameter.name);
            }
          } else {
            queryStringSchema.properties[parameter.name] = parameter.schema;
            if (parameter.required) {
              queryStringSchema.required.push(parameter.name);
            }
          }
        }

        if (parameter.in === "path") {
          pathParameterSchema.properties[parameter.name] = parameter.schema;
          if (parameter.required) {
            pathParameterSchema.required.push(parameter.name);
          }
        }
      }

      outputJson(
        `./api/parameters/schemas`,
        `${path}-${method}-query-string`,
        queryStringSchema
      );
      outputJson(
        `./api/parameters/schemas`,
        `${path}-${method}-multivalue-query-string`,
        multiValueQueryStringSchema
      );
      outputJson(
        `./api/parameters/schemas`,
        `${path}-${method}-path-parameter`,
        pathParameterSchema
      );
    }

    /**
     * paths.method.requestBodyのスキーマ出力
     */
    if (requestBody.content) {
      console.log(requestBody);
    }
  }
}

/**
 * components.schemas
 */
for (const schema in oasParse.components.schemas) {
  outputJson(
    `./api/components/schemas`,
    schema,
    oasParse.components.schemas[schema]
  );
}
