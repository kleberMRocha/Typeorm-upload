import csvParse from 'csv-parse';
import fs from 'fs';
import { getRepository, In } from 'typeorm';
import Category from '../models/Category';
import Transaction from '../models/Transaction';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class ImportTransactionsService {
  async execute(filePath: string): Promise<Transaction[]> {
    const contactReadStream = fs.createReadStream(filePath);
    const parser = csvParse({ from_line: 2 });
    const parseCsv = contactReadStream.pipe(parser);
    const transactions: Request[] = [];
    const categoryList: string[] = [];

    parseCsv.on('data', async line => {
      const [title, type, value, category] = line.map((cell: string) => {
        return cell.trim();
      });
      if (!title || !type || !value) return;

      categoryList.push(category);
      transactions.push({ title, type, value, category });
    });
    await new Promise(resolve => parseCsv.on('end', resolve));
    const categoryRepository = getRepository(Category);
    const existentCategorys = await categoryRepository.find({
      where: { title: In(categoryList) },
    });

    const categoryTitle = existentCategorys.map(category => {
      return category.title;
    });

    const addCaegory = categoryList
      .filter(category => {
        return !categoryTitle.includes(category);
      })
      .filter((value, index, self) => self.indexOf(value) === index);

    const newCategory = categoryRepository.create(
      addCaegory.map(title => ({ title })),
    );
    await categoryRepository.save(newCategory);

    const finalCategorys = [...newCategory, ...existentCategorys];

    const transactionRepository = getRepository(Transaction);

    const finalTransactions = transactions.map(transaction => {
      return {
        title: transaction.title,
        type: transaction.type,
        value: transaction.value,
        category: finalCategorys.find(category => {
          return category.title === transaction.category;
        }),
      };
    });

    const createTransaction = transactionRepository.create(finalTransactions);
    await transactionRepository.save(finalTransactions);

    return createTransaction;
  }
}

export default ImportTransactionsService;
