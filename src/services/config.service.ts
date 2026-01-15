import { prisma } from '../config/database.js';
import { AppError } from '../middleware/errorHandler.js';

export class ConfigService {
  async getConfig(key: string) {
    const config = await prisma.systemConfiguration.findUnique({
      where: { key },
    });

    if (!config) {
      throw new AppError(404, `Configuration key '${key}' not found`);
    }

    return config;
  }

  async getAllConfigs(category?: string) {
    const configs = await prisma.systemConfiguration.findMany({
      where: category ? { category, isActive: true } : { isActive: true },
    });

    return configs;
  }

  async setConfig(key: string, value: any, description?: string, category?: string) {
    const existing = await prisma.systemConfiguration.findUnique({
      where: { key },
    });

    if (existing) {
      return prisma.systemConfiguration.update({
        where: { key },
        data: {
          value: JSON.stringify(value),
          description,
          category,
          updatedAt: new Date(),
        },
      });
    } else {
      return prisma.systemConfiguration.create({
        data: {
          key,
          value: JSON.stringify(value),
          description,
          category,
        },
      });
    }
  }

  async deleteConfig(key: string) {
    const config = await prisma.systemConfiguration.findUnique({
      where: { key },
    });

    if (!config) {
      throw new AppError(404, `Configuration key '${key}' not found`);
    }

    await prisma.systemConfiguration.delete({
      where: { key },
    });

    return { message: 'Configuration deleted successfully' };
  }

  async toggleConfigStatus(key: string) {
    const config = await prisma.systemConfiguration.findUnique({
      where: { key },
    });

    if (!config) {
      throw new AppError(404, `Configuration key '${key}' not found`);
    }

    return prisma.systemConfiguration.update({
      where: { key },
      data: {
        isActive: !config.isActive,
        updatedAt: new Date(),
      },
    });
  }

  async getConfigsByCategory(category: string) {
    return prisma.systemConfiguration.findMany({
      where: { category, isActive: true },
    });
  }
}

export const configService = new ConfigService();
