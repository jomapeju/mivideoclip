/* eslint-disable */
// myclip_back/src/videos/contests/contests.controller.ts
import { Controller, Get, Post, Param, Body, Put, Delete, UseGuards } from '@nestjs/common';
import { ContestsService } from './contests.service';
import { CreateContestDto } from './dto/create-contest.dto';
import { UpdateContestDto } from './dto/update-contest.dto';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';

@Controller('contests')
export class ContestsController {
  constructor(private readonly contestsService: ContestsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() dto: CreateContestDto) {
    return this.contestsService.create(dto);
  }

  @Get()
  findAll() {
    return this.contestsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.contestsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateContestDto) {
    return this.contestsService.update(id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.contestsService.remove(id);
  }
}
