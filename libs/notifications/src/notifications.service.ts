import { Injectable, Logger } from '@nestjs/common';
import {
  BatchResponse,
  Message,
  MulticastMessage,
} from 'firebase-admin/lib/messaging/messaging-api';
import { FirebaseService } from '../../firebase/src';

export interface NotificationPayload {
  title: string;
  body: string;
  type: string;
  data?: Record<string, string>;
}

@Injectable()
export class NotificationsService {
  constructor(private readonly firebaseService: FirebaseService) {}

  async sendBroadcastTopic(
    topic: string,
    notificationPayload: NotificationPayload,
  ): Promise<string | void> {
    return await this.sendToTopic(topic, notificationPayload);
  }

  async sendGlobalNotification(
    topic: string,
    notificationPayload: NotificationPayload,
  ): Promise<string> {
    const topicResponse = await this.sendToTopic(topic, notificationPayload);
    return topicResponse;
  }

  async sendNotificationToUser(
    userTopic: string,
    notificationPayload: NotificationPayload,
  ): Promise<string | void> {
    const topicResponse = await this.sendToTopic(
      userTopic,
      notificationPayload,
    );
    Logger.log(`Notification sent to user ${userTopic}`, 'NotificationService');
    return topicResponse;
  }

  async sendToTopic(
    topic: string,
    notificationPayload: NotificationPayload,
  ): Promise<string> {
    const { title, body } = notificationPayload;

    const message: Message = {
      notification: { title, body },
      data: notificationPayload.data,
      android: {
        notification: {
          sound: 'default',
        },
      },
      apns: {
        payload: {
          aps: {
            sound: 'default',
          },
        },
      },
      topic,
    };
    Logger.log(`Sending notification to topic ${topic}`, 'NotificationService');
    return await this.firebaseService.getMessaging().send(message);
  }

  async sendTestTopic(driverId: number): Promise<string> {
    const message: Message = {
      notification: {
        title: 'Topic Notification',
        body: 'Topic Notification test for subsceibed topic',
      },
      android: {
        notification: {
          sound: 'default',
        },
      },
      apns: {
        payload: {
          aps: {
            sound: 'default',
          },
        },
      },
      topic: `driver_${driverId}`,
    };

    return await this.firebaseService.getMessaging().send(message);
  }

  async sendToToken(
    fcmTokens: string[],
    notificationPayload: NotificationPayload,
  ): Promise<BatchResponse | void> {
    const { title, body } = notificationPayload;

    if (!fcmTokens.length) return;

    const message: MulticastMessage = {
      notification: { title, body },
      data: notificationPayload.data,
      android: {
        notification: {
          sound: 'default',
        },
      },
      apns: {
        payload: {
          aps: {
            sound: 'default',
          },
        },
      },
      tokens: fcmTokens,
    };
    return await this.firebaseService
      .getMessaging()
      .sendEachForMulticast(message);
  }

  async sendTestToken(fcmToken: string): Promise<string> {
    const message: Message = {
      notification: {
        title: 'Token Notification',
        body: 'Token Notification test for single token',
      },
      android: {
        notification: {
          sound: 'default',
        },
      },
      apns: {
        payload: {
          aps: {
            sound: 'default',
          },
        },
      },
      token: fcmToken,
    };

    return await this.firebaseService.getMessaging().send(message);
  }
}
