import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from './generated/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    const connectionString = process.env['DATABASE_URL'];
    const pool = new Pool({ connectionString });
    const adapter = new PrismaPg(pool);

    super({ adapter });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  // Soft delete helper methods
  async softDelete<T>(
    model: { update: Function },
    where: Record<string, unknown>,
  ): Promise<T> {
    return model.update({
      where,
      data: { deletedAt: new Date() },
    });
  }

  async findManyActive<T>(
    model: { findMany: Function },
    args: { where?: Record<string, unknown>; [key: string]: unknown } = {},
  ): Promise<T[]> {
    return model.findMany({
      ...args,
      where: {
        ...(args.where || {}),
        deletedAt: null,
      },
    });
  }

  async findFirstActive<T>(
    model: { findFirst: Function },
    args: { where?: Record<string, unknown>; [key: string]: unknown } = {},
  ): Promise<T | null> {
    return model.findFirst({
      ...args,
      where: {
        ...(args.where || {}),
        deletedAt: null,
      },
    });
  }

  async findUniqueActive<T>(
    model: { findUnique: Function },
    args: { where?: Record<string, unknown>; [key: string]: unknown },
  ): Promise<T | null> {
    return model.findUnique({
      ...args,
      where: {
        ...(args.where || {}),
        deletedAt: null,
      },
    });
  }

  async restore<T>(
    model: { update: Function },
    where: Record<string, unknown>,
  ): Promise<T> {
    return model.update({
      where,
      data: { deletedAt: null },
    });
  }

  async hardDelete<T>(
    model: { delete: Function },
    where: Record<string, unknown>,
  ): Promise<T> {
    return model.delete({ where });
  }

  // Transaction helper
  async executeTransaction<T>(
    fn: (
      tx: Omit<
        PrismaClient,
        '$connect' | '$disconnect' | '$on' | '$transaction' | '$extends'
      >,
    ) => Promise<T>,
  ): Promise<T> {
    return this.$transaction(fn);
  }
}
