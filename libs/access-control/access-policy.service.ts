import { PrismaService } from '@app/prisma';
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateAccessPolicyDto } from './dto/create-access-policy.dto';
import { UpdateAccessPolicyDto } from './dto/update-access-policy.dto';
import {
  Action,
  AllowDenyPolicy,
  AppResource,
  GroupPolicy,
} from './enums/access.enum';
import {
  AccessPolicy,
  Owner,
} from 'apps/yatri-urban-backend/prisma/generated/client';

@Injectable()
export class AccessPolicyService {
  constructor(private readonly prisma: PrismaService) {}
  create(createAccessPolicyDto: CreateAccessPolicyDto): Promise<AccessPolicy> {
    return this.prisma.accessPolicy.create({ data: createAccessPolicyDto });
  }

  update(
    id: number,
    updateAccessControlDto: UpdateAccessPolicyDto,
  ): Promise<AccessPolicy> {
    return this.prisma.accessPolicy.update({
      where: { id },
      data: updateAccessControlDto,
    });
  }

  async findById(id: number): Promise<AccessPolicy> {
    const accessPolicy = await this.prisma.accessPolicy.findUnique({
      where: { id },
    });
    if (!accessPolicy) {
      throw new NotFoundException();
    }
    return accessPolicy;
  }

  async findAll(
    select?: Record<string, unknown>,
    query?: Record<string, unknown>,
  ): Promise<{ items: AccessPolicy[] }> {
    const items = await this.prisma.accessPolicy.findMany({
      where: query,
      select,
    });
    return { items };
  }

  async getRules(access_id: number): Promise<{ items: GroupPolicy }> {
    const accessPolicy = await this.prisma.accessPolicy.findFirst({
      where: {
        id: access_id,
      },
      include: {
        rules: {
          include: {
            resourceAction: true,
            actionCondition: true,
          },
        },
      },
    });
    if (!accessPolicy) {
      throw new NotFoundException(`Role with id ${access_id} not found`);
    }

    const grouped: GroupPolicy = { allow: {}, deny: {} };
    for (const rule of accessPolicy.rules) {
      const { resource, effect, resourceAction, actionCondition } = rule;
      const actionName = resourceAction.name;

      if (!grouped[effect]) {
        grouped[effect] = {};
      }

      if (!grouped[effect][resource]) {
        grouped[effect][resource] = { actions: {} };
      }

      const actionBlock: Record<string, unknown> = {};

      if (actionCondition) {
        actionBlock.actionCondition = {
          label: actionCondition.label,
          ...(actionCondition.condition && {
            condition: actionCondition.condition as Record<string, string>,
          }),
        };
      }

      grouped[effect][resource].actions[actionName] = actionBlock;
    }

    return { items: grouped };
  }

  async evaluate(
    user: Partial<Owner>,
    resource: AppResource,
    action: Action,
  ): Promise<{ status: boolean; query?: Record<string, unknown> }> {
    if (!user?.accessId) {
      throw new ForbiddenException('User does not have access permissions');
    }

    const userPolicies = await this.getRules(user.accessId);

    return this.matchesResourceActionEffect(
      userPolicies.items as unknown as AllowDenyPolicy,
      resource,
      action,
      user,
    );
  }

  private matchesResourceActionEffect(
    rules: AllowDenyPolicy,
    resource: string,
    action: Action,
    user: Partial<Owner>,
  ): { status: boolean; query?: Record<string, unknown> } {
    const denyActions = {
      ...(rules?.deny?.['*']?.actions ?? {}),
      ...(rules?.deny?.[resource]?.actions ?? {}),
    };

    if (denyActions[action] || denyActions['*']) {
      return { status: false };
    }

    const allowActions = {
      ...(rules?.allow?.['*']?.actions ?? {}),
      ...(rules?.allow?.[resource]?.actions ?? {}),
    };

    const allowDef = allowActions[action] ?? allowActions['*'];
    if (!allowDef) {
      return { status: false };
    }

    const condition = allowDef.actionCondition?.condition;
    if (!condition) {
      return { status: true };
    }

    const query = this.buildPrismaQuery(condition, user);
    return { status: true, query };
  }

  private resolveValue(value: unknown, resourceContext: unknown): unknown {
    if (
      typeof value === 'string' &&
      value.startsWith('${') &&
      value.endsWith('}')
    ) {
      const path = value.slice(2, -1).split('.');
      return path.reduce(
        (acc, part) => (acc as unknown as Record<string, unknown>)?.[part],
        { resourceContext },
      );
    }
    return value;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private setNestedProperty(obj: any, path: string[], value: any): void {
    const lastKey = path.pop();
    const nested = path.reduce((o, key) => (o[key] ??= {}), obj);
    if (Array.isArray(value)) {
      nested[lastKey!] = { in: value };
    } else {
      nested[lastKey!] = value;
    }
  }

  private buildPrismaQuery(
    conditions: Record<string, unknown>,
    resourceContext: unknown,
  ): Record<string, unknown> {
    const result: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(conditions)) {
      const path = key.split('.');
      const resolvedValue = this.resolveValue(value, resourceContext);
      this.setNestedProperty(result, path, resolvedValue);
    }

    return result;
  }
}
