import { Module } from '@nestjs/common';
import { UploadController } from './upload.controller';
import { UploadUseCase } from './upload.usecase';
import { MetricsService } from './metrics.service';
import { ExcelService } from './excel.service';

@Module({
  controllers: [UploadController],
  providers: [UploadUseCase, MetricsService, ExcelService],
})
export class UploadModule {}
