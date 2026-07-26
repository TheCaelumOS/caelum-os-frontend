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
import { createReadStream } from 'fs';
import { basename } from 'path';
import { FilesystemService } from './filesystem.service';
import { 
  ListFilesDto, 
  ReadFileDto, 
  WriteFileDto, 
  DeleteFileDto, 
  MkdirDto, 
  MoveFileDto, 
  DownloadFileDto 
} from './dto/filesystem.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('File System Manager')
@Controller('filesystem')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class FilesystemController {
  constructor(private readonly filesystemService: FilesystemService) {}

  @Get('list')
  @ApiOperation({ summary: 'List folders and files in a directory' })
  @ApiResponse({ status: 200, description: 'Directory list fetched successfully.' })
  listFiles(@Query() query: ListFilesDto) {
    return this.filesystemService.listFiles(query.path || '/');
  }

  @Get('read')
  @ApiOperation({ summary: 'Read file text content' })
  @ApiResponse({ status: 200, description: 'File content read successfully.' })
  readFile(@Query() query: ReadFileDto) {
    return this.filesystemService.readFile(query.path);
  }

  @Post('write')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Write text content into a file' })
  @ApiResponse({ status: 200, description: 'File saved successfully.' })
  writeFile(@Body() dto: WriteFileDto) {
    return this.filesystemService.writeFile(dto.path, dto.content);
  }

  @Post('delete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a file or directory path recursive' })
  @ApiResponse({ status: 200, description: 'Path deleted successfully.' })
  deleteFile(@Body() dto: DeleteFileDto) {
    return this.filesystemService.deleteFile(dto.path);
  }

  @Post('mkdir')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Create a new directory' })
  @ApiResponse({ status: 200, description: 'Directory created successfully.' })
  mkdir(@Body() dto: MkdirDto) {
    return this.filesystemService.mkdir(dto.path);
  }

  @Post('move')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Rename or move a file/folder' })
  @ApiResponse({ status: 200, description: 'Relocation completed successfully.' })
  moveFile(@Body() dto: MoveFileDto) {
    return this.filesystemService.moveFile(dto.source, dto.destination);
  }

  @Post('upload')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload file to specified directory' })
  @ApiResponse({ status: 200, description: 'File uploaded successfully.' })
  uploadFile(
    @Query('path') path: string,
    @UploadedFile() file: any,
  ) {
    return this.filesystemService.handleUpload(path || '/', file);
  }

  @Post('download')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Download file from path as a streamable file' })
  @ApiResponse({ status: 200, description: 'File stream initialized.' })
  async downloadFile(
    @Body() dto: DownloadFileDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    const path = this.filesystemService.getSafePath(dto.path);
    const fileStream = createReadStream(path);
    res.set({
      'Content-Type': 'application/octet-stream',
      'Content-Disposition': `attachment; filename="${basename(path)}"`,
    });
    return new StreamableFile(fileStream);
  }
}
