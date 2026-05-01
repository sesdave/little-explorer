import { Module } from '@nestjs/common';
import { S3Service } from './s3.service';

@Module({
  providers: [S3Service],
  exports: [S3Service], // 👈 This allows FamilyModule to use it
})
export class S3Module {}