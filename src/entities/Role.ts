import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from "typeorm";
import { Supervisor } from "./Supervisor";

@Entity()
export class Role {
  constructor() {}

  @PrimaryGeneratedColumn("increment")
  id!: number;

  @Column({})
  title!: string;

  @OneToMany(() => Supervisor, (supervisor) => supervisor.role)
  supervisors!: Supervisor[];
}
