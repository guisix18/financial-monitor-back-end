import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaTransactionRepository } from 'src/repositories/prisma/transaction/prisma-transaction.repository';
import {
  CreateTransactionDto,
  FilterTransaction,
  TransactionDto,
  UpdateTransactionDto,
} from './dto/transaction.dto';
import { UserFromJwt } from 'src/auth/models/UserFromJwt';
import { RecordWithId } from 'src/common/record-with-id.dto';
import {
  TRANSACTION_NOT_FOUND,
  TRANSACTION_NOT_FOUND_OR_DELETED,
} from './utils/transactions.exceptions';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import { createObjectCsvWriter } from 'csv-writer';
import * as archiver from 'archiver';
import * as path from 'path';
import { UploadService } from 'src/upload/upload.service';
import { randomUUID } from 'crypto';
import { FilterDataCountPanel } from 'src/dashboard/dto/dashboard.dto';

@Injectable()
export class TransactionService {
  constructor(
    private readonly transactionRepository: PrismaTransactionRepository,
    private readonly configService: ConfigService,
    private readonly uploadService: UploadService,
  ) {}

  async createTransaction(
    dto: CreateTransactionDto,
    user: UserFromJwt,
  ): Promise<RecordWithId> {
    const transaction = await this.transactionRepository.createTransaction(
      dto,
      user,
    );

    return {
      id: transaction.id,
    };
  }

  async findManyTransactions(
    filters: FilterTransaction,
    user: UserFromJwt,
  ): Promise<TransactionDto[]> {
    return await this.transactionRepository.findManyTransactions(filters, user);
  }

  async updateTransaction(
    id: number,
    dto: UpdateTransactionDto,
    user: UserFromJwt,
  ): Promise<RecordWithId> {
    const transaction = await this.transactionRepository.findOneTransaction(
      id,
      user,
    );

    if (!transaction) throw new NotFoundException(TRANSACTION_NOT_FOUND);

    const updatedTransaction =
      await this.transactionRepository.updateTransaction(id, dto, user);

    return {
      id: updatedTransaction.id,
    };
  }

  async deleteTransaction(id: number, user: UserFromJwt): Promise<void> {
    const transaction = await this.transactionRepository.findOneTransaction(
      id,
      user,
    );

    if (!transaction) {
      throw new NotFoundException(TRANSACTION_NOT_FOUND_OR_DELETED);
    }

    return await this.transactionRepository.deleteTransaction(id, user);
  }

  async createReport(filters: FilterTransaction, user: UserFromJwt) {
    console.log(filters);
    const now = new Date().toISOString().replace(/:/g, '-');
    const tempDir = this.configService.get('TEMP_DIR') ?? '/tmp';

    fs.mkdirSync(tempDir, { recursive: true });

    const filepath = `${tempDir}/transaction-report-${
      user.id
    }-${randomUUID()}-${now}.csv`;

    const csvWriter = createObjectCsvWriter({
      path: filepath,
      header: [
        { id: 'id', title: 'ID' },
        { id: 'category', title: 'Category' },
        { id: 'description', title: 'Description' },
        { id: 'type', title: 'Type' },
        { id: 'value', title: 'Value' },
        { id: 'made_in', title: 'Date' },
      ],
    });

    const transactions = (
      await this.transactionRepository.findManyTransactions(filters, user)
    ).map((transaction) => ({
      ...transaction,
      made_in: new Date(transaction.made_in).toISOString().split('T')[0],
    }));

    if (transactions.length === 0) return;

    await csvWriter.writeRecords(transactions);

    const zipFilepath = `${tempDir}/transaction-report-${user.id}-${now}.zip`;
    const output = fs.createWriteStream(zipFilepath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    archive.pipe(output);
    archive.file(filepath, { name: path.basename(filepath) });

    await archive.finalize();

    try {
      const fileBuffer = fs.readFileSync(filepath);
      //Tenho que melhorar isso aqui, ainda não faço ideia do CACETE que funciona enviando o CSV direto
      //Mas mandando o arquivo zip(o que faz sentido, compacta e mantém o arquivo mais leve) não funciona. Essa bosta.
      await this.uploadService.uploadReport(filepath, fileBuffer);
    } catch (err) {
      console.error('Error uploading report:', err);
    } finally {
      fs.unlinkSync(filepath);
      fs.unlinkSync(zipFilepath);
    }

    return;
  }

  async countTransactions(filters: FilterDataCountPanel, user: UserFromJwt) {
    return this.transactionRepository.countTransactions(filters, user);
  }
}
