import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TasksService } from './tasks.service';

@ApiTags('tasks')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller()
export class TasksController {
  constructor(private tasksService: TasksService) {}

  @ApiOperation({ summary: 'Get all tasks for a project' })
  @Get('projects/:projectId/tasks')
  getProjectTasks(@Param('projectId') projectId: string) {
    return this.tasksService.getProjectTasks(projectId);
  }

  @ApiOperation({ summary: 'Create a task' })
  @Post('projects/:projectId/tasks')
  create(@Param('projectId') projectId: string, @Body() body: any) {
    return this.tasksService.create({ ...body, projectId });
  }

  @ApiOperation({ summary: 'Update a task' })
  @Patch('tasks/:taskId')
  update(@Param('taskId') taskId: string, @Body() dto: any) {
    return this.tasksService.update(taskId, dto);
  }

  @ApiOperation({ summary: 'Move a task to a different column' })
  @Patch('tasks/:taskId/move')
  move(
    @Param('taskId') taskId: string,
    @Body('columnId') columnId: string,
    @Body('position') position: number,
  ) {
    return this.tasksService.move(taskId, columnId, position);
  }

  @ApiOperation({ summary: 'Delete a task' })
  @Delete('tasks/:taskId')
  delete(@Param('taskId') taskId: string) {
    return this.tasksService.delete(taskId);
  }
}
