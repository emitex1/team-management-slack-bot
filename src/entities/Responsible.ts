import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from "typeorm";
import { Candidate } from "./Candidate";
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

  @ManyToOne(() => Candidate, (candidate) => candidate.supervisors)
  candidate!: Candidate;

  @ManyToOne(() => Role, (role) => role.supervisors)
  role!: Role;
}
