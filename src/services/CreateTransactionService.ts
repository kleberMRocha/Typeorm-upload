import { getRepository, getCustomRepository } from 'typeorm';
import AppError from '../errors/AppError';
import TransactionRepository from '../repositories/TransactionsRepository';
import Transaction from '../models/Transaction';
import Category from '../models/Category';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Transaction> {
    const transactionRepository = getCustomRepository(TransactionRepository);
    const categoryRepository = getRepository(Category);

    if (type === 'outcome') {
      const { total } = await transactionRepository.getBalance(
        await transactionRepository.find(),
      );
      if (total - value < 0) {
        throw new AppError('balance are insufficient');
      }
    }

    const isCategoryExist = await categoryRepository.findOne({
      where: { title: category },
    });

    let newCategory = isCategoryExist || undefined;

    if (!isCategoryExist) {
      newCategory = categoryRepository.create({ title: category });
      await categoryRepository.save(newCategory);
    }

    const transaction = transactionRepository.create({
      title,
      value,
      type,
      category: newCategory,
      category_id: newCategory?.id,
    });

    await transactionRepository.save(transaction);
    return transaction;
  }
}

export default CreateTransactionService;
