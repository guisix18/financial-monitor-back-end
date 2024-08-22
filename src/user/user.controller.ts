import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Delete,
  HttpCode,
  HttpStatus,
  Req,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto, UpdateUserDto, UserInfos } from './dto/user.dto';
import { RecordWithId } from '../../src/common/record-with-id.dto';
import { FindOneParams } from '../../src/common/find-one-params.dto';
import { IsPublic } from '../../src/auth/decorators/is-public.decorator';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @IsPublic()
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createUser(@Body() dto: CreateUserDto): Promise<RecordWithId> {
    return await this.userService.createUser(dto);
  }

  @IsPublic()
  @Get('/validate-account/:code')
  @HttpCode(HttpStatus.NO_CONTENT)
  async validateAccount(@Param('code') code: string): Promise<void> {
    return await this.userService.validateAccount(code);
  }

  @Get('/:id')
  @HttpCode(HttpStatus.OK)
  async findOneUser(@Param() filters: FindOneParams): Promise<UserInfos> {
    return await this.userService.findOneUser(filters.id);
  }

  @Patch('/:id')
  @HttpCode(HttpStatus.ACCEPTED)
  async updateUser(
    @Body() dto: UpdateUserDto,
    @Param() filters: FindOneParams,
  ): Promise<RecordWithId> {
    return await this.userService.updateUser(dto, filters.id);
  }

  @Delete('/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteUser(@Param() filters: FindOneParams): Promise<void> {
    return await this.userService.deleteUser(filters.id);
  }
}
