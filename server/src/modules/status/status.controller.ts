import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import { StatusService } from './status.service';
import { Public } from '../auth/guards/public.decorator';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Status')
@Controller()
export class StatusController {
  constructor(private readonly statusService: StatusService) {}

  @Public()
  @ApiOperation({ summary: 'Get application status in JSON format' })
  @Get('status-json')
  async getAppStatusJson() {
    return this.statusService.getAppStatus();
  }

  @Public()
  @Get()
  async getAppStatusPage(@Res() res: Response) {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    const status = await this.statusService.getAppStatus();
    return res.render('status', status);
  }
}
