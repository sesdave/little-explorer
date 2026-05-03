import { Controller, Get, Res } from '@nestjs/common';
import { join } from 'path';
import { Response } from 'express';

@Controller()
export class SpaController {
  @Get('*')
  serve(@Res() res: Response) {
    return res.sendFile(join(__dirname, '..', 'client', 'index.html'));
  }
}