import { Injectable } from '@nestjs/common';
import * as ExcelJS from 'exceljs';

interface RowData {
  quantidadeCobrancas: number;
  cobradaACadaXDias: number;
  dataInicio: Date;
  status: string;
  dataStatus: Date;
  dataCancelamento: Date;
  valor: number;
  proximoCiclo: Date;
  idAssinante: string;
}

@Injectable()
export class ExcelService {
  private async getFileType(
    file: Express.Multer.File,
    workbook: ExcelJS.Workbook,
  ) {
    if (
      file.mimetype ===
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ) {
      return await workbook.xlsx.readFile(file.path);
    } else if (file.mimetype === 'text/csv') {
      return await workbook.csv.readFile(file.path);
    } else {
      throw new Error('Unsupported file type');
    }
  }

  async processFile(file: Express.Multer.File): Promise<any[]> {
    const workbook = new ExcelJS.Workbook();
    await this.getFileType(file, workbook);

    const worksheet = workbook.getWorksheet();
    const data = [];

    worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
      if (rowNumber === 1) return;

      const rowData: RowData = {
        quantidadeCobrancas: row.getCell(1).value as number,
        cobradaACadaXDias: row.getCell(2).value as number,
        dataInicio: row.getCell(3).value as Date,
        status: row.getCell(4).value as string,
        dataStatus: row.getCell(5).value as Date,
        dataCancelamento: row.getCell(6).value as Date,
        valor: parseFloat(row.getCell(7).value as string) as number,
        proximoCiclo: row.getCell(8).value as Date,
        idAssinante: row.getCell(9).value as string,
      };

      data.push(rowData);
    });

    return data;
  }
}
