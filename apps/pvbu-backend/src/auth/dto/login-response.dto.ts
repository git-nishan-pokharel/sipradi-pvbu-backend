import { ApiProperty } from '@nestjs/swagger';

export class LoginResponseDto {
  @ApiProperty({ example: 'Login successful' })
  message: string;

  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  accessToken: string;

  @ApiProperty({
    example: {
      id: '9a39c532-5a36-44ce-ae49-46acbd74e3d3',
      registeredName: 'Nishan Pokharel',
      displayName: 'Nishan',
      email: 'nishan@example.com',
      role: 'customer',
    },
  })
  user: {
    id: string;
    registeredName: string;
    displayName: string;
    email: string;
    phoneNumber?: string;
    role: string;
  };
}
