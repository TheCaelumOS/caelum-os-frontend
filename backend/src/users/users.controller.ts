import { Controller, Get, Put, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdatePreferencesDto } from './dto/users.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('preferences')
  @ApiOperation({ summary: 'Retrieve system preferences for the current logged-in user' })
  @ApiResponse({ status: 200, description: 'Preferences fetched successfully.' })
  @ApiResponse({ status: 401, description: 'Unauthorized access session.' })
  getPreferences(@GetUser('id') userId: string) {
    return this.usersService.getPreferences(userId);
  }

  @Put('preferences')
  @ApiOperation({ summary: 'Update UI settings, volume, or display brightness parameters' })
  @ApiResponse({ status: 200, description: 'Preferences saved successfully.' })
  @ApiResponse({ status: 401, description: 'Unauthorized access session.' })
  updatePreferences(
    @GetUser('id') userId: string,
    @Body() dto: UpdatePreferencesDto,
  ) {
    return this.usersService.updatePreferences(userId, dto);
  }
}
