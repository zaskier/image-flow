import { TypeOrmModuleOptions } from "@nestjs/typeorm";
import { Image } from "../../domain/entities/image.entity";

export const typeOrmConfig: TypeOrmModuleOptions = {
  type: "postgres",
  host: process.env.DATABASE_HOST || "localhost",
  port: parseInt(process.env.DATABASE_PORT || "5432", 10),
  username: process.env.DATABASE_USER || "user",
  password: process.env.DATABASE_PASSWORD || "password",
  database: process.env.DATABASE_NAME || "image_flow",
  entities: [Image],
  migrations: [__dirname + "/migrations/*.ts"],
  migrationsRun: false,
  synchronize: false,
};
