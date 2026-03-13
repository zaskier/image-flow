import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './infrastructure/adapters/app.controller';
import { AppService } from './application/services/app.service';
import { typeOrmConfig } from './infrastructure/database/ormconfig';

@Module({
  imports: [
    TypeOrmModule.forRoot(typeOrmConfig),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
