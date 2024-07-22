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
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto, UpdateUserDto, UserInfos } from './dto/user.dto';
import { RecordWithId } from '../../src/common/record-with-id.dto';
import { FindOneParams } from '../../src/common/find-one-params.dto';
import { IsPublic } from '../../src/auth/decorators/is-public.decorator';
import { Request } from 'express';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { CheckResource } from 'src/auth/decorators/check-resource.decorator';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @IsPublic()
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createUser(
    @Body() dto: CreateUserDto,
    @Req() request: Request,
  ): Promise<RecordWithId> {
    return await this.userService.createUser(dto, request);
  }

  @IsPublic()
  @Get('/validate-account/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async validateAccount(@Param() filters: FindOneParams): Promise<void> {
    return await this.userService.validateAccount(filters.id);
  }

  @Get('/:id')
  @UseGuards(RolesGuard)
  @CheckResource('user')
  @HttpCode(HttpStatus.OK)
  async findOneUser(@Param() filters: FindOneParams): Promise<UserInfos> {
    return await this.userService.findOneUser(filters.id);
  }

  @Patch('/:id')
  @UseGuards(RolesGuard)
  @CheckResource('user')
  @HttpCode(HttpStatus.ACCEPTED)
  async updateUser(
    @Body() dto: UpdateUserDto,
    @Param() filters: FindOneParams,
  ): Promise<RecordWithId> {
    return await this.userService.updateUser(dto, filters.id);
  }

  @Delete('/:id')
  @UseGuards(RolesGuard)
  @CheckResource('user')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteUser(@Param() filters: FindOneParams): Promise<void> {
    return await this.userService.deleteUser(filters.id);
  }
}
