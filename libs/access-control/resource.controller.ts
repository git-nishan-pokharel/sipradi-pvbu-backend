import { Body, Controller, Param, Patch, Post } from '@nestjs/common';
import {
  AddActionConditionDto,
  AddActionsDto,
  CreateResourceDto,
} from './dto/create-resource.dto';
import { ResourceService } from './resource.service';
import {
  ActionCondition,
  Resource,
} from 'apps/pvbu-backend/prisma/generated/prisma/client';
import { AccessControlDecorator } from './decorators/access-control.decorator';
import { Action, AppResource } from './enums/access.enum';

@Controller('resource')
export class ResourceController {
  constructor(private readonly accessPolicyService: ResourceService) {}

  @AccessControlDecorator({
    action: Action.create,
    resource: AppResource.accessManagement,
  })
  @Post('create-resource')
  create(@Body() createResourceDto: CreateResourceDto): Promise<Resource> {
    return this.accessPolicyService.createResource(createResourceDto);
  }

  @AccessControlDecorator({
    action: Action.create,
    resource: AppResource.accessManagement,
  })
  @Post('generate-resource')
  generate(): Promise<{ message: string }> {
    return this.accessPolicyService.generateResource();
  }

  @AccessControlDecorator({
    action: Action.update,
    resource: AppResource.accessManagement,
  })
  @Patch(':resourceId/add-action')
  addActions(
    @Param('resourceId') resourceId: string,
    @Body() addActionDto: AddActionsDto,
  ): Promise<{ count: number }> {
    return this.accessPolicyService.addResourceActions(
      +resourceId,
      addActionDto,
    );
  }

  @AccessControlDecorator({
    action: Action.update,
    resource: AppResource.accessManagement,
  })
  @Patch(':actionId/add-condition')
  addActionCondition(
    @Param('actionId') actionId: string,
    @Body() addActionConditionDto: AddActionConditionDto,
  ): Promise<ActionCondition> {
    return this.accessPolicyService.addActionCondition(
      +actionId,
      addActionConditionDto,
    );
  }
}
