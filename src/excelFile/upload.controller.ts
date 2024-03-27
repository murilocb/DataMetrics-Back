import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express/multer';
import { diskStorage } from 'multer';
import { UploadUseCase } from './upload.usecase';

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadUseCase: UploadUseCase) {}

  @Post()
  @UseInterceptors(FileInterceptor('file', { storage: diskStorage({}) }))
  async execute(@UploadedFile() file: Express.Multer.File) {
    return await this.uploadUseCase.execute(file);
  }
}
