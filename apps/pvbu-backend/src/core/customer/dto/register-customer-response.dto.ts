import { ApiProperty } from '@nestjs/swagger';

export class RegisterCustomerResponseDto {
  @ApiProperty({ example: 'Passenger registered successfully.' })
  message: string;

  @ApiProperty({
    example: {
      id: 1,
      firstName: 'Manjil',
      lastName: 'Koirala',
      email: 'manjil@example.com',
      phoneNumber: '+9779812345678',
      isPhoneVerified: true,
      createdAt: new Date().toISOString(),
    },
  })
  passenger: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    isPhoneVerified: boolean;
    createdAt: Date;
    updatedAt: Date | null;
  };
}
