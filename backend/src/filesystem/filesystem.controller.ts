import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Query, 
  UseGuards, 
  UseInterceptors, 
  UploadedFile, 
  Res, 
  HttpStatus, 
  HttpCode, 
  StreamableFile 
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { Response } from 'express';
import { createReadStream, existsSync, statSync } from 'fs';
import { basename } from 'path';
import { FilesystemService } from './filesystem.service';
import { 
  ListFilesDto, 
  ReadFileDto, 
  WriteFileDto, 
  DeleteFileDto, 
  MkdirDto, 
  MoveFileDto, 
  CopyFileDto,
  DownloadFileDto,
  SearchFilesDto
} from './dto/filesystem.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';

@ApiTags('File System Manager')
@Controller('filesystem')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class FilesystemController {
  constructor(private readonly filesystemService: FilesystemService) {}

  private extractUserId(user: any): string {
    return user?.id || user?.sub || 'dev-user-uuid-1234';
  }

  @Get('list')
  @ApiOperation({ summary: 'List folders and files in a directory for the authenticated user' })
  @ApiResponse({ status: 200, description: 'Directory list fetched successfully.' })
  listFiles(@GetUser() user: any, @Query() query: ListFilesDto) {
    const userId = this.extractUserId(user);
    return this.filesystemService.listFiles(userId, query.path || '/');
  }

  @Get('read')
  @ApiOperation({ summary: 'Read file text content for the authenticated user' })
  @ApiResponse({ status: 200, description: 'File content read successfully.' })
  readFile(@GetUser() user: any, @Query() query: ReadFileDto) {
    const userId = this.extractUserId(user);
    return this.filesystemService.readFile(userId, query.path);
  }

  @Post('write')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Write text content into a user file' })
  @ApiResponse({ status: 200, description: 'File saved successfully.' })
  writeFile(@GetUser() user: any, @Body() dto: WriteFileDto) {
    const userId = this.extractUserId(user);
    return this.filesystemService.writeFile(userId, dto.path, dto.content);
  }

  @Post('delete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a user file or directory path recursive' })
  @ApiResponse({ status: 200, description: 'Path deleted successfully.' })
  deleteFile(@GetUser() user: any, @Body() dto: DeleteFileDto) {
    const userId = this.extractUserId(user);
    return this.filesystemService.deleteFile(userId, dto.path);
  }

  @Post('mkdir')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Create a new directory in user storage' })
  @ApiResponse({ status: 200, description: 'Directory created successfully.' })
  mkdir(@GetUser() user: any, @Body() dto: MkdirDto) {
    const userId = this.extractUserId(user);
    return this.filesystemService.mkdir(userId, dto.path);
  }

  @Post('move')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Rename or move a user file/folder' })
  @ApiResponse({ status: 200, description: 'Relocation completed successfully.' })
  moveFile(@GetUser() user: any, @Body() dto: MoveFileDto) {
    const userId = this.extractUserId(user);
    return this.filesystemService.moveFile(userId, dto.source, dto.destination);
  }

  @Post('copy')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Copy/duplicate a user file or directory' })
  @ApiResponse({ status: 200, description: 'Duplication completed successfully.' })
  copyFile(@GetUser() user: any, @Body() dto: CopyFileDto) {
    const userId = this.extractUserId(user);
    return this.filesystemService.copyFile(userId, dto.source, dto.destination);
  }

  @Post('upload')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload file to specified directory in user storage' })
  @ApiResponse({ status: 200, description: 'File uploaded successfully.' })
  uploadFile(
    @GetUser() user: any,
    @Query('path') path: string,
    @UploadedFile() file: any,
  ) {
    const userId = this.extractUserId(user);
    return this.filesystemService.handleUpload(userId, path || '/', file);
  }

  @Get('search')
  @ApiOperation({ summary: 'Search files and folders recursively in user storage' })
  @ApiResponse({ status: 200, description: 'Search results returned successfully.' })
  searchFiles(@GetUser() user: any, @Query() query: SearchFilesDto) {
    const userId = this.extractUserId(user);
    return this.filesystemService.searchFiles(userId, query.query, query.path || '/');
  }

  @Get('quota')
  @ApiOperation({ summary: 'Retrieve user storage quota and usage breakdown' })
  @ApiResponse({ status: 200, description: 'Storage quota retrieved.' })
  getQuota(@GetUser() user: any) {
    const userId = this.extractUserId(user);
    return this.filesystemService.getQuota(userId);
  }

  @Post('download')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Download user file as stream' })
  @ApiResponse({ status: 200, description: 'File stream initialized.' })
  async downloadFile(
    @GetUser() user: any,
    @Body() dto: DownloadFileDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    const userId = this.extractUserId(user);
    const path = this.filesystemService.getSafePath(userId, dto.path);
    if (!existsSync(path) || statSync(path).isDirectory()) {
      res.status(HttpStatus.NOT_FOUND);
      return null as any;
    }
    const fileStream = createReadStream(path);
    res.set({
      'Content-Type': 'application/octet-stream',
      'Content-Disposition': `attachment; filename="${basename(path)}"`,
    });
    return new StreamableFile(fileStream);
  }

  @Get('download')
  @ApiOperation({ summary: 'Download user file via GET stream' })
  @ApiResponse({ status: 200, description: 'File stream initialized.' })
  async downloadFileGet(
    @GetUser() user: any,
    @Query('path') filePath: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    const userId = this.extractUserId(user);
    const path = this.filesystemService.getSafePath(userId, filePath);
    if (!existsSync(path) || statSync(path).isDirectory()) {
      res.status(HttpStatus.NOT_FOUND);
      return null as any;
    }
    const fileStream = createReadStream(path);
    res.set({
      'Content-Type': 'application/octet-stream',
      'Content-Disposition': `attachment; filename="${basename(path)}"`,
    });
    return new StreamableFile(fileStream);
  }
}
