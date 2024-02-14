import "reflect-metadata";
import { DataSource } from "typeorm";
import { Candidate } from "./Candidate";
import { Responsible } from "./Responsible";
import { Role } from "./Role";
import { GeneralServices } from "../services/GeneralServices";

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
      const generalServices = GeneralServices();
      const initResult = await generalServices.initializeRoles();
      if (initResult !== true) {
        console.log("Error in initializing the data: " + initResult);
        return;
      }
      console.log("Data Source has been initialized!");
    })
    .catch((error) =>
      console.log("Error in data source initialization, ", error)
    );
} catch (error) {
  console.log("Error in data source initialization, ", error);
}
