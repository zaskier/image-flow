import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  AfterLoad,
  AfterInsert,
} from "typeorm";
import { ImageStatus } from "@common/enums/image-status.enum";

@Entity("images")
export class Image {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  title: string;

  @Column({ unique: true })
  original_s3_key: string;

  @Column({ nullable: true })
  processed_s3_key: string;

  public_url: string | null = null;

  @Column({
    type: "enum",
    enum: ImageStatus,
    default: ImageStatus.PENDING,
  })
  status: ImageStatus;

  @Column({ nullable: true })
  width: number;

  @Column({ nullable: true })
  height: number;

  @Column({ default: 0 })
  attempts: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @AfterLoad()
  @AfterInsert()
  setPublicUrl() {
    if (this.processed_s3_key) {
      const baseUrl = process.env.MINIO_PUBLIC_URL || "http://localhost:9000/images";
      this.public_url = `${baseUrl}/${this.processed_s3_key}`;
    } else {
      this.public_url = null;
    }
  }
}
