import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from "typeorm";
import { Supervisor } from "./Supervisor";

@Entity()
export class Teammate {
  constructor() {
    this.firstName = "";
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
  firstName: string;

  @Column({
    length: 120,
    nullable: true,
  })
  lastName?: string;

  @Column({
    length: 120,
    nullable: true,
  })
  displayName?: string;

  @Column({
    length: 20,
  })
  slackMemberId: string;

  @Column({
    length: 200,
    nullable: true,
  })
  avatarUrl?: string;

  @Column({})
  isActive: boolean;

  @Column({})
  creationDate: number;

  @Column({ nullable: true })
  editionDate: number;

  @OneToMany(() => Supervisor, (supervisor) => supervisor.teammate)
  supervisors!: Supervisor[];
}
