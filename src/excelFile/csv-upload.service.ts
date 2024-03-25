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
export class CsvUploadService {
  async processCSV(file: Express.Multer.File) {
    const workbook = new ExcelJS.Workbook();
    await workbook.csv.readFile(file.path);

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

    const statsData = {};

    data.forEach((row) => {
      const dataInicio = new Date(row.dataInicio);
      const monthYear = `${dataInicio.getMonth() + 1}/${dataInicio.getFullYear()}`;

      if (!statsData[monthYear]) {
        statsData[monthYear] = {
          ativa: 0,
          cancelada: 0,
          trial: 0,
          valor: 0,
          quantidadeCobrancas: 0,
          cobrancaACadaXDias: 0,
          qtdIDAssinante: 0,
          MRR: 0,
          churnRate: 0,
        };
      }

      statsData[monthYear].ativa +=
        row.status.toLowerCase() === 'ativa' ? 1 : 0;
      statsData[monthYear].cancelada +=
        row.status.toLowerCase() === 'cancelada' ? 1 : 0;
      statsData[monthYear].trial +=
        row.status.toLowerCase() === 'trial cancelado' ? 1 : 0;
      statsData[monthYear].valor += row.valor;
      statsData[monthYear].quantidadeCobrancas += row.quantidadeCobrancas;
      statsData[monthYear].cobrancaACadaXDias += row.cobradaACadaXDias;
      statsData[monthYear].qtdIDAssinante += 1;

      if (row.status === 'Ativa') {
        statsData[monthYear].MRR += Number(row.valor);
      }
    });

    // Calculate MRR and Churn Rate for each month
    Object.keys(statsData).forEach((monthYear) => {
      const { ativa, cancelada, valor } = statsData[monthYear];
      statsData[monthYear].MRR = ativa > 0 ? Number(valor) / ativa : 0;
      statsData[monthYear].churnRate =
        (cancelada / (ativa + cancelada)) * 100 || 0;
    });

    const formattedData = Object.keys(statsData).map((monthYear) => {
      const {
        ativa,
        cancelada,
        trial,
        valor,
        quantidadeCobrancas,
        cobrancaACadaXDias,
        qtdIDAssinante,
        MRR,
        churnRate,
      } = statsData[monthYear];

      return {
        chave: `${monthYear}`,
        ativa,
        cancelada,
        trial,
        valor,
        quantidadeCobrancas,
        cobrancaACadaXDias,
        qtdIDAssinante,
        MRR: Math.round(MRR),
        churnRate,
      };
    });

    // Ordenar os dados pelo ano e pelo mês
    formattedData.sort((a, b) => {
      const [monthA, yearA] = a.chave.split('/');
      const [monthB, yearB] = b.chave.split('/');
      if (parseInt(yearA) !== parseInt(yearB)) {
        return parseInt(yearA) - parseInt(yearB);
      } else {
        return parseInt(monthA) - parseInt(monthB);
      }
    });

    const quantidadeCancelada = data.filter(
      (item) => item.status.toLowerCase() === 'cancelada',
    ).length;
    const quantidadeAtiva = data.filter(
      (item) => item.status.toLowerCase() === 'ativa',
    ).length;
    const quantidadeTrial = data.filter(
      (item) => item.status.toLowerCase() === 'trial cancelado',
    ).length;
    const totalRegistros = data.length;
    const porcentagemStatus = {
      ativa: Math.round((quantidadeAtiva / totalRegistros) * 100),
      cancelada: Math.round((quantidadeCancelada / totalRegistros) * 100),
      trial: Math.round((quantidadeTrial / totalRegistros) * 100),
    };
    /* console.log({
      formattedData,
      porcentagemStatus,
    }); */
    return {
      formattedData,
      porcentagemStatus,
    };
  }
}
