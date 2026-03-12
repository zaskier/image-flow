import { Module } from '@nestjs/common';
import { AppController } from './infrastructure/adapters/app.controller';
import { AppService } from './application/services/app.service';


@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
