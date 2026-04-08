import { Controller, Get, Res } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { HealthService } from './health.service';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @ApiOperation({
    summary: 'Readiness summary',
    description: 'Returns dependency-aware readiness information for database, cache, and runtime health.',
  })
  @ApiOkResponse({ description: 'Current readiness snapshot.' })
  async getHealth(@Res({ passthrough: true }) response: Response) {
    const { httpStatus, ...payload } = await this.healthService.getReadiness();
    response.status(httpStatus);
    return payload;
  }

  @Get('live')
  @ApiOperation({
    summary: 'Liveness probe',
    description: 'Reports whether the NestJS process is running and able to respond to requests.',
  })
  @ApiOkResponse({ description: 'Liveness payload.' })
  getLiveness() {
    return this.healthService.getLiveness();
  }

  @Get('ready')
  @ApiOperation({
    summary: 'Readiness probe',
    description: 'Reports whether critical dependencies are ready or the service is operating in degraded fallback mode.',
  })
  @ApiOkResponse({ description: 'Readiness payload.' })
  async getReadiness(@Res({ passthrough: true }) response: Response) {
    const { httpStatus, ...payload } = await this.healthService.getReadiness();
    response.status(httpStatus);
    return payload;
  }
}
