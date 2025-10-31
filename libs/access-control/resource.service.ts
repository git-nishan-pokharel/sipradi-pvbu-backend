import { PrismaService } from '@app/prisma';
import { Injectable } from '@nestjs/common';
import {
  AddActionConditionDto,
  AddActionsDto,
  CreateResourceDto,
} from './dto/create-resource.dto';
import { ResourceActionsMap } from './enums/access.enum';
import {
  ActionCondition,
  Prisma,
  Resource,
} from 'apps/yatri-urban-backend/prisma/generated/client';

@Injectable()
export class ResourceService {
  constructor(protected readonly prisma: PrismaService) {}

  async createResource(
    createResourceDto: CreateResourceDto,
  ): Promise<Resource> {
    const { name, actions } = createResourceDto;
    return this.prisma.resource.create({
      data: {
        name,
        actions: {
          create: actions.map((actionName) => ({
            name: actionName,
          })),
        },
      },
    });
  }

  async generateResource(): Promise<{ message: string }> {
    const prisma = this.prisma;
    for (const [resourceKey, actions] of Object.entries(ResourceActionsMap)) {
      const resource = await prisma.resource.upsert({
        where: { name: resourceKey },
        update: {},
        create: { name: resourceKey },
      });

      for (const { name: actionName, actionCondition } of actions) {
        const resourceAction = await prisma.resourceAction.upsert({
          where: {
            name_resourceId: {
              name: actionName,
              resourceId: resource.id,
            },
          },
          update: {},
          create: {
            name: actionName,
            resource: { connect: { id: resource.id } },
          },
        });

        if (actionCondition?.length && actionCondition?.length > 0) {
          await prisma.actionCondition.createMany({
            data: actionCondition.map(({ label, condition }) => ({
              resourceActionId: resourceAction.id,
              label,
              condition: condition as unknown as Prisma.InputJsonValue,
            })),
          });
        }
      }
    }

    return { message: 'Resources created' };
  }

  async addResourceActions(
    resourceId: number,
    addActionDto: AddActionsDto,
  ): Promise<{ count: number }> {
    const { actions } = addActionDto;

    return this.prisma.resourceAction.createMany({
      data: actions.map((name) => ({
        name,
        resourceId,
      })),
      skipDuplicates: true, // optional: avoids error on duplicate (name, resource_id)
    });
  }

  async addActionCondition(
    actionId: number,
    addActionConditionDto: AddActionConditionDto,
  ): Promise<ActionCondition> {
    return this.prisma.actionCondition.create({
      data: {
        label: addActionConditionDto.label,
        condition: addActionConditionDto.condition,
        resourceActionId: actionId,
      },
    });
  }
}
