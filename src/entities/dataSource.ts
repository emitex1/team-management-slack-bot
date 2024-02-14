import "reflect-metadata";
import { DataSource } from "typeorm";
import { Candidate } from "./Candidate";
import { Responsible } from "./Responsible";
import { Role } from "./Role";
import { GeneralServices } from "../services/GeneralServices";
import { elogGreen, elogRed } from "../util/logHelper";

export const AppDataSource = new DataSource({
  type: "sqlite",
  database: "database.sqlite",
  entities: [Candidate, Responsible, Role],
  synchronize: true,
  logging: false,
});

// to initialize the initial connection with the database, register all entities
// and "synchronize" database schema, call "initialize()" method of a newly created database
// once in your application bootstrap
try {
  AppDataSource.initialize()
    .then(async () => {
      const initResult = await GeneralServices.initializeRoles();
      if (initResult !== true) {
        elogRed("Error in initializing the data: " + initResult);
        return;
      }
      elogGreen("Data Source has been initialized!");
    })
    .catch((error) => elogRed("Error in data source initialization, ", error));
} catch (error) {
  elogRed("Error in data source initialization, ", error);
}
