import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from "typeorm";
import { Responsible } from "./Responsible";

@Entity()
export class Candidate {
  constructor() {
    this.name = "";
    this.isActive = true;
    this.creationDate = Date.now() / 1;
  }

  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({
    length: 50,
    nullable: true,
  })
  title?: string;

  @Column({
    length: 100,
  })
  name: string;

  @Column({
    length: 120,
    nullable: true,
  })
  lastName?: string;

  @Column({
    length: 50,
    nullable: true,
  })
  userName?: string;

  @Column({})
  isActive: boolean;

  @Column({})
  creationDate: number;

  @Column({ nullable: true })
  editionDate: number;

  @OneToMany(() => Responsible, (responsible) => responsible.candidate)
  responsibles!: Responsible[];
}
