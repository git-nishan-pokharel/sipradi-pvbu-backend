import { AccessRuleEffect } from 'apps/pvbu-backend/prisma/generated/prisma/client';

export enum Action {
  all = '*',
  read = 'read',
  create = 'create',
  delete = 'delete',
  update = 'update',
  assign = 'assign',
  updateSelf = 'updateSelf',
}

export enum AppResource {
  all = '*',
  accessManagement = 'accessManagement',
  routes = 'routes',
  vehicle = 'vehicle',
  owner = 'owner',
  driver = 'driver',
  transactions = 'transactions',
  passenger = 'passenger',
  wallet = 'wallet',
  trips = 'trips',
  feedback = 'feedback',
  emergencyAlerts = 'emergencyAlerts',
  kycUpload = 'kycUpload',
}

export type ActionDefinition = {
  actionCondition?: ResourceActionCondition;
};

type ResourceActionCondition = {
  label: string;
  condition: Record<string, unknown>;
};

type ResourcePolicy = {
  actions: Record<string, ActionDefinition>;
  effect?: AccessRuleEffect;
};

export type AllowDenyPolicy = {
  allow: Record<string, ResourcePolicy>;
  deny: Record<string, ResourcePolicy>;
};

export interface IAccessPolicyDecorator {
  resource: AppResource;
  action: Action;
}

type ActionConditionBlock = {
  actionCondition?: {
    label: string;
    condition?: Record<string, string>;
  };
};

type ResourceActions = {
  actions: {
    [action: string]: ActionConditionBlock;
  };
};

export type GroupPolicy = {
  allow: {
    [resource: string]: ResourceActions;
  };
  deny: {
    [resource: string]: ResourceActions;
  };
};

export const ResourceActionsMap: Record<
  AppResource,
  { name: Action; actionCondition?: ResourceActionCondition[] }[]
> = {
  [AppResource.all]: [
    { name: Action.all },
    { name: Action.read },
    { name: Action.create },
    { name: Action.update },
  ],
  [AppResource.accessManagement]: [
    { name: Action.all },
    { name: Action.read },
    { name: Action.create },
    { name: Action.update },
  ],
  [AppResource.routes]: [
    { name: Action.all },
    { name: Action.read },
    { name: Action.create },
    { name: Action.update },
    { name: Action.assign },
  ],
  [AppResource.vehicle]: [
    { name: Action.all },
    {
      name: Action.read,
      actionCondition: [
        {
          label: 'User matches the resource owner',
          condition: { ownerId: '${resourceContext.id}' },
        },
        {
          label: 'User matches the resource driver',
          condition: { driverId: '${resourceContext.id}' },
        },
      ],
    },
    { name: Action.create },
    {
      name: Action.update,
      actionCondition: [
        {
          label: 'User matches the resource owner',
          condition: { ownerId: '${resourceContext.id}' },
        },
      ],
    },
    { name: Action.assign },
  ],
  [AppResource.owner]: [
    { name: Action.all },
    {
      name: Action.read,
    },
    { name: Action.create },
    {
      name: Action.update,
    },
    { name: Action.updateSelf },
  ],
  [AppResource.driver]: [
    { name: Action.all },
    {
      name: Action.read,
      actionCondition: [
        {
          label: 'User matches the driver owner',
          condition: { createdBy: '${resourceContext.id}' },
        },
      ],
    },
    { name: Action.create },
    {
      name: Action.update,
      actionCondition: [
        {
          label: 'User matches the driver owner',
          condition: { createdBy: '${resourceContext.id}' },
        },
      ],
    },
    {
      name: Action.updateSelf,
    },
    {
      name: Action.assign,
      actionCondition: [
        {
          label: 'User matches the driver owner',
          condition: { createdBy: '${resourceContext.id}' },
        },
      ],
    },
  ],
  [AppResource.transactions]: [
    { name: Action.all },
    {
      name: Action.read,
      actionCondition: [
        {
          label: 'User matches self',
          condition: { customerId: '${resourceContext.id}' },
        },
      ],
    },
    { name: Action.create },
    { name: Action.update },
  ],
  [AppResource.wallet]: [
    { name: Action.all },
    {
      name: Action.read,
      actionCondition: [
        {
          label: 'User matches self',
          condition: { customerId: '${resourceContext.id}' },
        },
      ],
    },
    { name: Action.create },
    { name: Action.update },
  ],
  [AppResource.passenger]: [
    { name: Action.all },
    {
      name: Action.read,
    },
    { name: Action.create },
    {
      name: Action.update,
    },
    {
      name: Action.updateSelf,
    },
  ],
  [AppResource.trips]: [
    { name: Action.all },
    {
      name: Action.read,
      actionCondition: [
        {
          label: 'User matches trip passenger',
          condition: { passengerId: '${resourceContext.id}' },
        },
        {
          label: 'User owns the vehicle',
          condition: {
            'vehicle.ownerId': '${resourceContext.id}',
          },
        },
        {
          label: 'User drives the vehicle',
          condition: {
            'vehicle.driverId': '${resourceContext.id}',
          },
        },
      ],
    },
    {
      name: Action.create,
    },
    {
      name: Action.update,
    },
  ],
  [AppResource.feedback]: [
    { name: Action.all },
    {
      name: Action.read,
      actionCondition: [
        {
          label: 'User matches the feedback passenger',
          condition: { passengerId: '${resourceContext.id}' },
        },
        {
          label: 'User matches the feedback driver',
          condition: { driverId: '${resourceContext.id}' },
        },
      ],
    },
    { name: Action.create },
    { name: Action.update },
    { name: Action.delete },
  ],
  [AppResource.emergencyAlerts]: [
    { name: Action.all },
    {
      name: Action.read,
      actionCondition: [
        {
          label: 'User matches the emergency alert passenger',
          condition: { passengerId: '${resourceContext.id}' },
        },
        {
          label: 'User matches the emergency alert vehicle driver',
          condition: { 'vehicle.driverId': '${resourceContext.id}' },
        },
        {
          label: 'User matches the emergency alert vehicle owner',
          condition: { 'vehicle.ownerId': '${resourceContext.id}' },
        },
      ],
    },
    { name: Action.create },
    { name: Action.update },
    { name: Action.delete },
  ],

  [AppResource.kycUpload]: [
    { name: Action.all },
    {
      name: Action.read,
      actionCondition: [
        {
          label: 'User matches the kyc passenger',
          condition: { passengerId: '${resourceContext.id}' },
        },
      ],
    },
    { name: Action.create },
    {
      name: Action.update,
      actionCondition: [
        {
          label: 'User matches the kyc passenger',
          condition: { passengerId: '${resourceContext.id}' },
        },
      ],
    },
    { name: Action.delete },
  ],
};
