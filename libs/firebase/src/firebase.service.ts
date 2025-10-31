import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';

@Injectable()
export class FirebaseService implements OnModuleInit {
  constructor(private readonly configService: ConfigService) {}
  async onModuleInit(): Promise<void> {
    try {
      if (!admin.apps.length) {
        admin.initializeApp({
          credential: admin.credential.cert({
            projectId: this.configService.get<string>('FIREBASE_PROJECT_ID'),
            privateKey: this.configService
              .get<string>('FIREBASE_PRIVATE_KEY')
              ?.replace(/\\n/g, '\n'),
            clientEmail: this.configService.get<string>(
              'FIREBASE_CLIENT_EMAIL',
            ),
          }),
        });
      }

      Logger.log('Firebase connected', 'FirebaseService');
    } catch (error) {
      Logger.error('Firebase connection failed', error, 'FirebaseService');
      // close application if Firebase connection fails
      process.exit(1);
    }
  }

  getMessaging(): admin.messaging.Messaging {
    return admin.messaging();
  }
}
