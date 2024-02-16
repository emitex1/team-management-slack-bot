import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from "typeorm";
import { Teammate } from "./Teammate";
import { Role } from "./Role";

@Entity()
export class Supervisor {
  constructor() {
    this.creationDate = Date.now() / 1;
  }

  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({})
  creationDate: number;

  @ManyToOne(() => Teammate, (teammate) => teammate.supervisors)
  teammate!: Teammate;

  @ManyToOne(() => Role, (role) => role.supervisors)
  role!: Role;
}
