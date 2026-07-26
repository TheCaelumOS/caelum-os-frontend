import { Controller, Get, Post, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { TerminalService } from './terminal.service';
import { CreateSessionDto } from './dto/terminal.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';

@ApiTags('Terminal & PTY Integration')
@Controller('terminal')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TerminalController {
  constructor(private readonly terminalService: TerminalService) {}

  @Get('sessions')
  @ApiOperation({ summary: 'List all active terminal sessions for the user' })
  @ApiResponse({ status: 200, description: 'Active sessions listed successfully.' })
  getSessions(@GetUser('id') userId: string) {
    return this.terminalService.getSessions(userId);
  }

  @Post('session')
  @ApiOperation({ summary: 'Spawn a new platform shell shell terminal session' })
  @ApiResponse({ status: 201, description: 'Terminal session spawned successfully.' })
  createSession(
    @GetUser('id') userId: string,
    @Body() dto: CreateSessionDto,
  ) {
    return this.terminalService.createSession(userId, dto);
  }

  @Delete('session/:id')
  @ApiOperation({ summary: 'Terminate and close an active terminal session' })
  @ApiResponse({ status: 200, description: 'Terminal session closed successfully.' })
  deleteSession(
    @GetUser('id') userId: string,
    @Param('id') sessionId: string,
  ) {
    return this.terminalService.deleteSession(userId, sessionId);
  }
}
