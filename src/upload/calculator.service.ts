import { Injectable } from '@nestjs/common';

@Injectable()
export class CalculatorService {
  calculateMRR(ativa: number, valor: number): number {
    return ativa > 0 ? valor / ativa : 0;
  }

  calculateChurnRate(ativa: number, cancelada: number): number {
    return (cancelada / (ativa + cancelada)) * 100 || 0;
  }
}
