import { Module } from '@nestjs/common';
import { UploadController } from './upload.controller';
import { XlsxUploadService } from './xlsx-upload.service';
import { CsvUploadService } from './csv-upload.service';

@Module({
  controllers: [UploadController],
  providers: [XlsxUploadService, CsvUploadService],
})
export class UploadModule {}
