import swaggerJsdoc from "swagger-jsdoc";
import { serve, setup } from "swagger-ui-express";
import YAML from "yaml";
import fs from "fs";

export default (app: any) => {
  const file = fs.readFileSync("config/swagger.yaml", "utf8");
  const swaggerDocument = YAML.parse(file);

  app.use("/apis", serve, setup(swaggerDocument));
};
