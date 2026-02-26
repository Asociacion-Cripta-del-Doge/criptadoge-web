import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [MongooseModule.forRoot('mongodb://localhost:27017/cripta-db')],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
