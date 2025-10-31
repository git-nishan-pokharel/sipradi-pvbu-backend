import {
  PipeTransform,
  Injectable,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import {
  AccessRulePayload,
  CreateAccessRulesDto,
  CreateRuleObject,
  UpdateAccessRulePayload,
  UpdateAccessRulesDto,
} from '../dto/create-access-rules.dto';
import { PrismaService } from '@app/prisma';
import { AccessRuleEffect } from 'apps/pvbu-backend/prisma/generated/prisma/client';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';

@Injectable()
export class RulesActionValidationPipe implements PipeTransform {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async transform(value: CreateAccessRulesDto): Promise<AccessRulePayload> {
    const policyId = value.policyId;

    const allEntries = [...value.allowActions, ...value.denyActions];

    const allActionIds = allEntries.map((entry) => entry.resourceActionId);
    const uniqueActionIds = [...new Set(allActionIds)];

    const existingActions = await this.prisma.resourceAction.findMany({
      where: { id: { in: uniqueActionIds } },
      select: { id: true, resource: { select: { name: true } } },
    });

    const foundIds = new Set(existingActions.map((a) => a.id));
    const invalidActionIds = uniqueActionIds.filter((id) => !foundIds.has(id));

    if (invalidActionIds.length > 0) {
      throw new BadRequestException(
        `Invalid resourceActionId(s): ${invalidActionIds.join(', ')}`,
      );
    }

    const allConditionEntries = allEntries.filter(
      (
        entry,
      ): entry is { resourceActionId: number; actionConditionId: number } =>
        typeof entry.actionConditionId === 'number',
    );
    const uniqueConditionIds = [
      ...new Set(allConditionEntries.map((e) => e.actionConditionId)),
    ];

    if (uniqueConditionIds.length > 0) {
      const existingConditions = await this.prisma.actionCondition.findMany({
        where: { id: { in: uniqueConditionIds } },
        select: { id: true, resourceActionId: true },
      });

      const conditionMap = new Map<number, number>();
      existingConditions.forEach((cond) => {
        conditionMap.set(cond.id, cond.resourceActionId);
      });

      const invalidLinks: string[] = [];
      for (const entry of allConditionEntries) {
        const expectedActionId = entry.resourceActionId;
        const actualLinkedActionId = conditionMap.get(entry.actionConditionId);

        if (!actualLinkedActionId) {
          invalidLinks.push(`ID ${entry.actionConditionId} (not found)`);
        } else if (actualLinkedActionId !== expectedActionId) {
          invalidLinks.push(
            `Condition ${entry.actionConditionId} does not belong to Action ${expectedActionId}`,
          );
        }
      }

      if (invalidLinks.length > 0) {
        throw new BadRequestException(
          `Invalid action-condition links:\n${invalidLinks.join('\n')}`,
        );
      }
    }

    const actionMap = new Map(
      existingActions.map((a) => [a.id, a.resource.name]),
    );

    const accessRulesData: AccessRulePayload = allEntries.map((entry) => {
      const effect = value.denyActions.includes(entry)
        ? AccessRuleEffect.deny
        : AccessRuleEffect.allow;
      const ruleIdentifier = `${policyId}-${entry?.resourceActionId}-${entry?.actionConditionId ?? 'null'}`;
      return {
        resourceActionId: entry.resourceActionId,
        actionConditionId: entry.actionConditionId ?? null,
        resource: actionMap.get(entry.resourceActionId)!,
        policyId: Number(policyId),
        effect,
        ruleIdentifier,
      };
    });

    return accessRulesData;
  }
}

@Injectable()
export class UpdateRulesActionValidationPipe implements PipeTransform {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(REQUEST) private readonly request: Request,
  ) {}

  async transform(
    value: UpdateAccessRulesDto,
  ): Promise<UpdateAccessRulePayload> {
    const policyId = +this.request.params.policy_id;
    const { allowActions = [], denyActions = [] } = value;

    const allEntries = [...allowActions, ...denyActions];
    if (allEntries.length === 0) {
      return { add: [], update: [], remove: [] };
    }

    const uniqueActionIds = [
      ...new Set(allEntries.map((e) => e.resourceActionId)),
    ];

    // Parallel validation of actions and existing rules
    const [existingActions, existingRules] = await Promise.all([
      this.validateResourceActions(uniqueActionIds),
      this.getExistingRules(policyId),
    ]);

    // Validate action conditions if any exist
    await this.validateActionConditions(allEntries);

    // Create maps for efficient lookups
    const actionMap = new Map(
      existingActions.map((a) => [a.id, a.resource.name]),
    );
    const existingRulesMap = this.createExistingRulesMap(existingRules);
    const incomingRulesMap = this.createIncomingRulesMap(
      allowActions,
      denyActions,
    );

    // Calculate differences efficiently
    const changes = this.calculateRuleChanges(
      existingRulesMap,
      incomingRulesMap,
    );

    return {
      add: changes.toAdd.map((id) =>
        this.mapToRule(id, incomingRulesMap.get(id)!, actionMap, policyId),
      ),
      update: changes.toUpdate.map((id) =>
        this.mapToRule(id, incomingRulesMap.get(id)!, actionMap, policyId),
      ),
      remove: changes.toRemove.map((id) =>
        this.mapToRule(id, existingRulesMap.get(id)!, actionMap, policyId),
      ),
    };
  }

  private async validateResourceActions(
    actionIds: number[],
  ): Promise<Array<{ id: number; resource: { name: string } }>> {
    const existingActions = await this.prisma.resourceAction.findMany({
      where: { id: { in: actionIds } },
      select: {
        id: true,
        resource: { select: { name: true } },
      },
    });

    const foundIds = new Set(existingActions.map((a) => a.id));
    const invalidIds = actionIds.filter((id) => !foundIds.has(id));

    if (invalidIds.length > 0) {
      throw new BadRequestException(
        `Invalid resourceActionId(s): ${invalidIds.join(', ')}`,
      );
    }

    return existingActions;
  }

  private async validateActionConditions(
    allEntries: Array<{ resourceActionId: number; actionConditionId?: number }>,
  ): Promise<void> {
    const entriesWithConditions = allEntries.filter(
      (
        entry,
      ): entry is { resourceActionId: number; actionConditionId: number } =>
        typeof entry.actionConditionId === 'number',
    );

    if (entriesWithConditions.length === 0) return;

    const uniqueConditionIds = [
      ...new Set(entriesWithConditions.map((e) => e.actionConditionId)),
    ];
    const existingConditions = await this.prisma.actionCondition.findMany({
      where: { id: { in: uniqueConditionIds } },
      select: { id: true, resourceActionId: true },
    });

    const conditionMap = new Map(
      existingConditions.map((c) => [c.id, c.resourceActionId]),
    );
    const invalidLinks: string[] = [];

    for (const entry of entriesWithConditions) {
      const linkedActionId = conditionMap.get(entry.actionConditionId);

      if (!linkedActionId) {
        invalidLinks.push(`Condition ${entry.actionConditionId} not found`);
      } else if (linkedActionId !== entry.resourceActionId) {
        invalidLinks.push(
          `Condition ${entry.actionConditionId} does not belong to Action ${entry.resourceActionId}`,
        );
      }
    }

    if (invalidLinks.length > 0) {
      throw new BadRequestException(
        `Invalid action-condition links:\n${invalidLinks.join('\n')}`,
      );
    }
  }

  private async getExistingRules(policyId: number): Promise<
    Array<{
      resourceActionId: number;
      actionConditionId: number | null;
      effect: AccessRuleEffect;
    }>
  > {
    return this.prisma.accessRules.findMany({
      where: { policyId },
      select: {
        resourceActionId: true,
        actionConditionId: true,
        effect: true,
      },
    });
  }

  private createExistingRulesMap(
    rules: Array<{
      resourceActionId: number;
      actionConditionId: number | null;
      effect: AccessRuleEffect;
    }>,
  ): Map<string, AccessRuleEffect> {
    return new Map(
      rules.map((r) => [
        this.createRuleKey(r.resourceActionId, r.actionConditionId),
        r.effect,
      ]),
    );
  }

  private createIncomingRulesMap(
    allowActions: Array<{
      resourceActionId: number;
      actionConditionId?: number;
    }>,
    denyActions: Array<{
      resourceActionId: number;
      actionConditionId?: number;
    }>,
  ): Map<string, AccessRuleEffect> {
    const map = new Map<string, AccessRuleEffect>();

    allowActions.forEach((action) =>
      map.set(
        this.createRuleKey(action.resourceActionId, action.actionConditionId),
        AccessRuleEffect.allow,
      ),
    );

    denyActions.forEach((action) =>
      map.set(
        this.createRuleKey(action.resourceActionId, action.actionConditionId),
        AccessRuleEffect.deny,
      ),
    );

    return map;
  }

  private createRuleKey(
    resourceActionId: number,
    actionConditionId?: number | null,
  ): string {
    return `${resourceActionId}:${actionConditionId ?? 'null'}`;
  }

  private calculateRuleChanges(
    existingMap: Map<string, AccessRuleEffect>,
    incomingMap: Map<string, AccessRuleEffect>,
  ): { toAdd: string[]; toUpdate: string[]; toRemove: string[] } {
    const toAdd: string[] = [];
    const toUpdate: string[] = [];
    const toRemove: string[] = [];

    // Check for additions and updates
    for (const [ruleKey, effect] of incomingMap) {
      const existingEffect = existingMap.get(ruleKey);

      if (existingEffect === undefined) {
        toAdd.push(ruleKey);
      } else if (existingEffect !== effect) {
        toUpdate.push(ruleKey);
      }
    }

    // Check for removals
    for (const ruleKey of existingMap.keys()) {
      if (!incomingMap.has(ruleKey)) {
        toRemove.push(ruleKey);
      }
    }

    return { toAdd, toUpdate, toRemove };
  }

  private mapToRule(
    ruleKey: string,
    effect: AccessRuleEffect,
    actionMap: Map<number, string>,
    policyId: number,
  ): CreateRuleObject {
    const [resourceActionIdStr, actionConditionIdStr] = ruleKey.split(':');
    const resourceActionId = Number(resourceActionIdStr);
    const actionConditionId =
      actionConditionIdStr === 'null' ? null : Number(actionConditionIdStr);
    const resource = actionMap.get(resourceActionId)!;
    const ruleIdentifier = `${policyId}-${resourceActionId}-${actionConditionIdStr}`;
    return {
      resourceActionId,
      actionConditionId,
      resource,
      policyId,
      effect,
      ruleIdentifier,
    };
  }
}
