import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { WebText, WebTextSchema } from './schemas/web-text.schema';
import { WebTextsController } from './web-texts.controller';
import { WebTextsService } from './web-texts.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: WebText.name, schema: WebTextSchema },
    ]),
  ],
  controllers: [WebTextsController],
  providers: [WebTextsService],
})
export class WebTextsModule {}
