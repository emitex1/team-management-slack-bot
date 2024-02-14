import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from "typeorm";
import { Candidate } from "./Candidate";
import { Role } from "./Role";

@Entity()
export class Responsible {
  constructor() {
    this.creationDate = Date.now() / 1;
  }

  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({})
  creationDate: number;

  @ManyToOne(() => Candidate, (candidate) => candidate.responsibles)
  candidate!: Candidate;

  @ManyToOne(() => Role, (role) => role.responsibles)
  role!: Role;
}
