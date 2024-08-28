import { Controller, Get, HttpCode, HttpStatus, Query } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import {
  DataCountResponseDto,
  FilterDataCountPanel,
} from './dto/dashboard.dto';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { UserFromJwt } from 'src/auth/models/UserFromJwt';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('/data-count')
  @HttpCode(HttpStatus.OK)
  async findAll(
    @Query() filters: FilterDataCountPanel,
    @CurrentUser() user: UserFromJwt,
  ): Promise<DataCountResponseDto> {
    return await this.dashboardService.dataCount(filters, user);
  }
}
