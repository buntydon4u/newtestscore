import { prisma } from '../config/database.js';
import fs from 'fs/promises';
import path from 'path';

export class MediaService {
  async list(where: any, skip: number, take: number) {
    return prisma.mediaAsset.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' }
    });
  }

  async count(where: any) {
    return prisma.mediaAsset.count({ where });
  }

  async getById(id: string) {
    return prisma.mediaAsset.findUnique({
      where: { id }
    });
  }

  async create(data: {
    filename: string;
    originalName: string;
    mimeType: string;
    size: number;
    path: string;
    altText?: string;
    description?: string;
  }, userId: string) {
    return prisma.mediaAsset.create({
      data: {
        ...data,
        uploadedBy: userId
      }
    });
  }

  async createMultiple(files: Array<{
    filename: string;
    originalName: string;
    mimeType: string;
    size: number;
    path: string;
  }>, userId: string) {
    return prisma.$transaction(async (tx) => {
      const created = [];

      for (const file of files) {
        const media = await tx.mediaAsset.create({
          data: {
            ...file,
            uploadedBy: userId
          }
        });
        created.push(media);
      }

      return created;
    });
  }

  async update(id: string, data: {
    altText?: string;
    description?: string;
  }, userId: string) {
    return prisma.mediaAsset.update({
      where: { id },
      data
    });
  }

  async delete(id: string, userId: string) {
    return prisma.$transaction(async (tx) => {
      const media = await tx.mediaAsset.findUnique({
        where: { id }
      });

      if (!media) {
        throw new Error('Media asset not found');
      }

      // Delete file from filesystem
      try {
        await fs.unlink(media.path);
      } catch (error) {
        console.error('Failed to delete file:', error);
      }

      // Update questions to remove media reference
      await tx.question.updateMany({
        where: { mediaAssetId: id },
        data: { mediaAssetId: null }
      });

      // Delete the media record
      return tx.mediaAsset.delete({
        where: { id }
      });
    });
  }

  async getByType(mimeType: string) {
    return prisma.mediaAsset.findMany({
      where: {
        mimeType: {
          contains: mimeType
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async getStats() {
    const [total, totalSize, byType] = await Promise.all([
      prisma.mediaAsset.count(),
      prisma.mediaAsset.aggregate({
        _sum: {
          size: true
        }
      }),
      prisma.mediaAsset.groupBy({
        by: ['mimeType'],
        _count: {
          mimeType: true
        },
        orderBy: {
          _count: {
            mimeType: 'desc'
          }
        }
      })
    ]);

    return {
      total,
      totalSize: totalSize._sum.size || 0,
      byType
    };
  }
}

export const mediaService = new MediaService();
