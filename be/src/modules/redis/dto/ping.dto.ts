import { IsNotEmpty, IsString } from 'class-validator';

export class PingDto {
  @IsString()
  @IsNotEmpty()
  clientId: string;
}