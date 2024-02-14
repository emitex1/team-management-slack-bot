import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from "typeorm";
import { Responsible } from "./Responsible";

@Entity()
export class Role {
  constructor() {}

  @PrimaryGeneratedColumn("increment")
  id!: number;

  @Column({})
  title!: string;

  @OneToMany(() => Responsible, (responsible) => responsible.role)
  responsibles!: Responsible[];
}
