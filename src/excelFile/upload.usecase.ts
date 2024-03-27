import { Injectable } from '@nestjs/common';
import { ExcelService } from './excel.service';
import { MetricsService } from './metrics.service';

@Injectable()
export class UploadUseCase {
  constructor(
    private readonly excelService: ExcelService,
    private readonly metricsService: MetricsService,
  ) {}

  async execute(file: Express.Multer.File) {
    //Primeiro passo processar o arquivo
    const fileData = await this.excelService.processFile(file);
    //Segundo Gerar as metricas dos dados processados
    const metricsData = await this.metricsService.genereteMetrics(fileData);
    // retorna as metricas
    return metricsData;
  }
}
