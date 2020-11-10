import { getRepository } from 'typeorm';
import AppError from '../errors/AppError';
import Transaction from '../models/Transaction';

class DeleteTransactionService {
  public async execute(id: string): Promise<void> {
    const transactionRepository = getRepository(Transaction);
    const isTransactionExist = await transactionRepository.findOne({
      where: { id },
    });
    if (!isTransactionExist) {
      throw new AppError('transaction Not found');
    }

    await transactionRepository.remove(isTransactionExist);
  }
}

export default DeleteTransactionService;
