import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(transactions: Transaction[]): Promise<Balance> {
    const balance = {
      income: 0,
      outcome: 0,
      total: 0,
    };

    transactions.forEach(transaction => {
      if (transaction.type === 'income') {
        balance.income = Number(transaction.value) + Number(balance.income);
        return;
      }
      balance.outcome = Number(transaction.value) + Number(balance.outcome);
    });

    balance.total = balance.income - balance.outcome;

    return balance;
  }
}

export default TransactionsRepository;
