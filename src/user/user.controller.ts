import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Delete,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto, UpdateUserDto, UserInfos } from './dto/user.dto';
import { RecordWithId } from 'src/common/record-with-id.dto';
import { FindOneParams } from 'src/common/find-one-params.dto';
import { IsPublic } from 'src/auth/decorators/is-public.decorator';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @IsPublic()
  @Post()
  async createUser(@Body() dto: CreateUserDto): Promise<RecordWithId> {
    return await this.userService.createUser(dto);
  }

  @Get('/:id')
  async findOneUser(@Param() filters: FindOneParams): Promise<UserInfos> {
    return await this.userService.findOneUser(filters.id);
  }

  @Patch('/:id')
  async updateUser(
    @Body() dto: UpdateUserDto,
    @Param() filters: FindOneParams,
  ): Promise<RecordWithId> {
    return await this.userService.updateUser(dto, filters.id);
  }

  @Delete('/:id')
  async deleteUser(@Param() filters: FindOneParams): Promise<void> {
    return await this.userService.deleteUser(filters.id);
  }
}
