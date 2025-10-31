import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { AccessRulesService } from './access-rules.service';
import {
  AccessRulePayload,
  CreateAccessRulesDto,
  UpdateAccessRulePayload,
  UpdateAccessRulesDto,
} from './dto/create-access-rules.dto';
import {
  RulesActionValidationPipe,
  UpdateRulesActionValidationPipe,
} from './pipes/resource-validation.pipe';
import {
  ActionCondition,
  Resource,
  ResourceAction,
} from 'apps/pvbu-backend/prisma/generated/prisma/client';
import { AccessControlDecorator } from './decorators/access-control.decorator';
import { Action, AppResource } from './enums/access.enum';

@Controller('access-rules')
export class AccessRulesController {
  constructor(private readonly accessPolicyService: AccessRulesService) {}

  @AccessControlDecorator({
    action: Action.create,
    resource: AppResource.accessManagement,
  })
  @Post()
  create(
    @Body(RulesActionValidationPipe)
    createAccessRulesDto: CreateAccessRulesDto,
  ): Promise<{ message: string; count: number }> {
    return this.accessPolicyService.createRules(
      createAccessRulesDto as unknown as AccessRulePayload,
    );
  }

  @AccessControlDecorator({
    action: Action.update,
    resource: AppResource.accessManagement,
  })
  @Patch(':policy_id')
  update(
    @Param('policy_id') policy_id: string,
    @Body(UpdateRulesActionValidationPipe)
    updateAccessRulesDto: UpdateAccessRulesDto,
  ): Promise<{ added: number; removed: number }> {
    return this.accessPolicyService.syncAccessRules(
      +policy_id,
      updateAccessRulesDto as unknown as UpdateAccessRulePayload,
    );
  }

  @AccessControlDecorator({
    action: Action.read,
    resource: AppResource.accessManagement,
  })
  @Get('resources')
  getResources(): Promise<{ items: Resource[] }> {
    return this.accessPolicyService.getResources();
  }

  @AccessControlDecorator({
    action: Action.read,
    resource: AppResource.accessManagement,
  })
  @Get('resources/actions')
  getResourceAction(): Promise<{ items: ResourceAction[] }> {
    return this.accessPolicyService.getResourcesAndActions();
  }

  @AccessControlDecorator({
    action: Action.read,
    resource: AppResource.accessManagement,
  })
  @Get('resources/:resource_id/actions')
  getResourceActionById(
    @Param('resource_id') resourceId: string,
  ): Promise<{ items: ResourceAction[] }> {
    return this.accessPolicyService.getActionsById(+resourceId);
  }

  @AccessControlDecorator({
    action: Action.read,
    resource: AppResource.accessManagement,
  })
  @Get('resources-actions/:action_id/conditions')
  getActionConditionsById(
    @Param('action_id') resourceActionId: string,
  ): Promise<{ items: ActionCondition[] }> {
    return this.accessPolicyService.getActionsConditionsById(+resourceActionId);
  }
}
