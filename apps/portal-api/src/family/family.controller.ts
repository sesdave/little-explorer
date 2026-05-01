// apps/api/src/family/family.controller.ts
import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  UseGuards, 
  Req, 
  UseInterceptors, 
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guard/jwt.guard';
import { FamilyService } from './family.service';
import { S3Service } from '../s3/s3.service';

@UseGuards(JwtAuthGuard)
@Controller('family')
export class FamilyController {
  constructor(
    private familyService: FamilyService,
    private s3Service: S3Service,
  ) {}

  @Get('dashboard')
  getDashboard(@Req() req: any) {
    return this.familyService.getDashboardData(req.user.id);
  }

  @Post('children')
  @UseInterceptors(FileInterceptor('photo')) // Matches the 'photo' field in your Frontend FormData
  async addChild(
    @Req() req: any,
    @Body() dto: { firstName: string; lastName: string; dob: string },
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 5 }), // 5MB limit
          new FileTypeValidator({ fileType: 'image/(jpeg|png|webp)' }),
        ],
        fileIsRequired: false, // Allows adding a child without a photo
      }),
    ) file?: Express.Multer.File,
  ) {
    let photoUrl: string | undefined;

    if (file) {
      // Upload to S3 and get the public URL
      photoUrl = await this.s3Service.uploadFile(file, req.user.id);
    }

    return this.familyService.createChild(req.user.id, {
      ...dto,
      photoUrl,
    });
  }
}