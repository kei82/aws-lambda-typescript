# OpenAPI JSON

serverless invoke local --function test -p src/body.json
serverless invoke local --function test2 -p src/body2.json

npx esbuild src/handler.ts --minify --bundle --platform=node --format=esm --outdir=dist --target=node20 "--external:@middy/\*"
