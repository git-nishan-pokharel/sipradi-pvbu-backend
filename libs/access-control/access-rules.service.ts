import { PrismaService } from '@app/prisma';
import { Injectable } from '@nestjs/common';
import {
  AccessRulePayload,
  UpdateAccessRulePayload,
} from './dto/create-access-rules.dto';
import {
  ActionCondition,
  Resource,
  ResourceAction,
} from 'apps/pvbu-backend/prisma/generated/prisma/client';

@Injectable()
export class AccessRulesService {
  constructor(protected readonly prisma: PrismaService) {}

  async createRules(
    dto: AccessRulePayload,
  ): Promise<{ message: string; count: number }> {
    const created = await this.prisma.accessRules.createMany({
      data: dto,
      skipDuplicates: true,
    });

    return { message: 'Access rules created', count: created.count };
  }

  async syncAccessRules(
    policyId: number,
    dto: UpdateAccessRulePayload,
  ): Promise<{ added: number; removed: number; updated: number }> {
    await this.prisma.$transaction(async (db) => {
      if (dto.add.length > 0) {
        await db.accessRules.createMany({ data: dto.add });
      }

      if (dto.update.length > 0) {
        await db.accessRules.updateMany({
          where: { policyId: policyId },
          data: dto.update,
        });
      }

      if (dto.remove.length > 0) {
        await db.accessRules.deleteMany({ where: { OR: dto.remove } });
      }
    });

    return {
      added: dto.add.length,
      updated: dto.update.length,
      removed: dto.remove.length,
    };
  }

  async getResources(): Promise<{ items: Resource[] }> {
    const resourceList = await this.prisma.resource.findMany();
    return { items: resourceList };
  }

  async getResourcesAndActions(): Promise<{ items: ResourceAction[] }> {
    const resourceList = await this.prisma.resourceAction.findMany({
      include: {
        resource: { select: { name: true } },
        actionCondition: { select: { label: true, id: true } },
      },
    });
    return { items: resourceList };
  }

  async getActionsById(
    resourceId: number,
  ): Promise<{ items: ResourceAction[] }> {
    const resourceList = await this.prisma.resourceAction.findMany({
      where: { resourceId },
      include: {
        resource: { select: { name: true } },
        actionCondition: { omit: { resourceActionId: true } },
      },
    });
    return { items: resourceList };
  }

  async getActionsConditionsById(
    resourceActionId: number,
  ): Promise<{ items: ActionCondition[] }> {
    const resourceList = await this.prisma.actionCondition.findMany({
      where: { resourceActionId },
      include: { resourceAction: { select: { name: true } } },
    });
    return { items: resourceList };
  }
}
