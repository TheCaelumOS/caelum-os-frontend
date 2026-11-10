import {
  Controller,
  Get,
  Post,
  Query,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { DmeService } from './dme.service';
import { QueryEventsDto } from './dto/query-events.dto';
import { CreateEventDto } from './dto/create-event.dto';
import { RunValidationDto } from './dto/run-validation.dto';

@ApiTags('DME: DevOps Management Engine')
@Controller('dme')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class DmeController {
  constructor(private readonly dmeService: DmeService) {}

  @Get('overview')
  @ApiOperation({ summary: 'Get overall DME health score and metrics' })
  async getOverview(@GetUser('id') userId: string) {
    return this.dmeService.getOverview(userId || 'default');
  }

  @Get('events')
  @ApiOperation({ summary: 'Query DME recorded events with filters' })
  async getEvents(
    @GetUser('id') userId: string,
    @Query() query: QueryEventsDto,
  ) {
    return this.dmeService.getEvents(query, userId || 'default');
  }

  @Post('events')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Record a new DME event' })
  async createEvent(
    @GetUser('id') userId: string,
    @Body() dto: CreateEventDto,
  ) {
    return this.dmeService.recordEvent(dto, userId || 'default');
  }

  @Post('events/capture')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Trigger on-demand event capture from all connected integrations' })
  async captureEvents(@GetUser('id') userId: string) {
    return this.dmeService.captureAndSync(userId || 'default');
  }

  @Post('validate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Execute internal DME validation engine audit' })
  async validate(
    @GetUser('id') userId: string,
    @Body() dto: RunValidationDto,
  ) {
    return this.dmeService.runValidation(dto, userId || 'default');
  }

  @Get('runs')
  @ApiOperation({ summary: 'Get validation runs audit history' })
  async getRuns(@GetUser('id') userId: string) {
    return this.dmeService.getRuns(userId || 'default');
  }

  @Get('rules')
  @ApiOperation({ summary: 'Get catalog of active DME validation rules' })
  async getRules() {
    return this.dmeService.getRules();
  }

  @Get('integrations')
  @ApiOperation({ summary: 'Get collector status for Docker, Kubernetes, Git, Terraform, Jenkins' })
  async getIntegrations(@GetUser('id') userId: string) {
    return this.dmeService.getIntegrations(userId || 'default');
  }
}
