import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express/multer';
import { diskStorage } from 'multer';
import { XlsxUploadService } from './xlsx-upload.service';
import { CsvUploadService } from './csv-upload.service';

@Controller('upload')
export class UploadController {
  constructor(
    private readonly xlsxUploadService: XlsxUploadService,
    private readonly csvUploadService: CsvUploadService,
  ) {}

  @Post()
  @UseInterceptors(FileInterceptor('file', { storage: diskStorage({}) }))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (
      file.mimetype ===
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ) {
      return this.xlsxUploadService.processXlsx(file);
    } else if (file.mimetype === 'text/csv') {
      return this.csvUploadService.processCSV(file);
    } else {
      throw new Error('Tipo de arquivo não suportado');
    }
  }
}
