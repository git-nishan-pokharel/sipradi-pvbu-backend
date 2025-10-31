import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { CreateAccessPolicyDto } from './dto/create-access-policy.dto';
import { AccessPolicyService } from './access-policy.service';
import { UpdateAccessPolicyDto } from './dto/update-access-policy.dto';
import { Action, AppResource, GroupPolicy } from './enums/access.enum';
import { AccessPolicy } from 'apps/yatri-urban-backend/prisma/generated/client';
import { AccessControlDecorator } from './decorators/access-control.decorator';

@Controller('access-policy')
export class AccessPolicyController {
  constructor(private readonly accessControlService: AccessPolicyService) {}

  @AccessControlDecorator({
    action: Action.create,
    resource: AppResource.accessManagement,
  })
  @Post()
  create(
    @Body() createAccessControlDto: CreateAccessPolicyDto,
  ): Promise<AccessPolicy> {
    return this.accessControlService.create(createAccessControlDto);
  }

  @AccessControlDecorator({
    action: Action.update,
    resource: AppResource.accessManagement,
  })
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateAccessControlDto: UpdateAccessPolicyDto,
  ): Promise<AccessPolicy> {
    return this.accessControlService.update(+id, updateAccessControlDto);
  }

  @AccessControlDecorator({
    action: Action.read,
    resource: AppResource.accessManagement,
  })
  @Get()
  findAll(): Promise<{ items: AccessPolicy[] }> {
    return this.accessControlService.findAll({
      id: true,
      title: true,
      description: true,
    });
  }

  @AccessControlDecorator({
    action: Action.read,
    resource: AppResource.accessManagement,
  })
  @Get(':id')
  get(@Param('id') id: string): Promise<AccessPolicy> {
    return this.accessControlService.findById(+id);
  }

  @AccessControlDecorator({
    action: Action.read,
    resource: AppResource.accessManagement,
  })
  @Get('rules/:policy_id')
  getRules(
    @Param('policy_id') policy_id: string,
  ): Promise<{ items: GroupPolicy }> {
    return this.accessControlService.getRules(+policy_id);
  }
}
