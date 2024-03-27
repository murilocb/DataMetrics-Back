interface MetricsGenerator {
  generateMetrics(fileData: any[]): Promise<any>;
}

import { Injectable } from '@nestjs/common';
import { CalculatorService } from './calculator.service';

@Injectable()
export class MetricsService implements MetricsGenerator {
  constructor(private readonly calculatorService: CalculatorService) {}

  async generateMetrics(fileData: any[]): Promise<any> {
    const statsData = {};

    fileData.forEach((row) => {
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

      if (row.status.toLowerCase() === 'ativa') {
        statsData[monthYear].MRR += Number(row.valor);
      }
    });

    // Calculate MRR and Churn Rate for each month
    Object.keys(statsData).forEach((monthYear) => {
      const { ativa, cancelada, valor } = statsData[monthYear];
      statsData[monthYear].MRR = this.calculatorService.calculateMRR(
        ativa,
        valor,
      );
      statsData[monthYear].churnRate =
        this.calculatorService.calculateChurnRate(ativa, cancelada);
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

    const quantidadeCancelada = fileData.filter(
      (item) => item.status.toLowerCase() === 'cancelada',
    ).length;
    const quantidadeAtiva = fileData.filter(
      (item) => item.status.toLowerCase() === 'ativa',
    ).length;
    const quantidadeTrial = fileData.filter(
      (item) => item.status.toLowerCase() === 'trial cancelado',
    ).length;
    const totalRegistros = fileData.length;
    const porcentagemStatus = {
      ativa: Math.round((quantidadeAtiva / totalRegistros) * 100),
      cancelada: Math.round((quantidadeCancelada / totalRegistros) * 100),
      trial: Math.round((quantidadeTrial / totalRegistros) * 100),
    };

    return {
      formattedData,
      porcentagemStatus,
    };
  }
}
