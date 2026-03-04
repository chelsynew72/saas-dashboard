import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, UseGuards, Request,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ProjectsService } from './projects.service';

@ApiTags('projects')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller()
export class ProjectsController {
  constructor(private projectsService: ProjectsService) {}

  @ApiOperation({ summary: 'Get all projects in an org' })
  @Get('orgs/:orgId/projects')
  getOrgProjects(@Param('orgId') orgId: string, @Request() req) {
    return this.projectsService.getOrgProjects(orgId, req.user._id);
  }

  @ApiOperation({ summary: 'Create a project' })
  @Post('orgs/:orgId/projects')
  create(
    @Param('orgId') orgId: string,
    @Body('name') name: string,
    @Body('description') description: string,
    @Request() req,
  ) {
    return this.projectsService.create(orgId, name, description || '', req.user._id);
  }

  @ApiOperation({ summary: 'Get a project by ID' })
  @Get('projects/:projectId')
  getById(@Param('projectId') projectId: string, @Request() req) {
    return this.projectsService.getById(projectId, req.user._id);
  }

  @ApiOperation({ summary: 'Update a project' })
  @Patch('projects/:projectId')
  update(
    @Param('projectId') projectId: string,
    @Body() dto: { name?: string; description?: string },
    @Request() req,
  ) {
    return this.projectsService.update(projectId, dto, req.user._id);
  }

  @ApiOperation({ summary: 'Archive a project' })
  @Delete('projects/:projectId')
  archive(@Param('projectId') projectId: string, @Request() req) {
    return this.projectsService.archive(projectId, req.user._id);
  }

  @ApiOperation({ summary: 'Add a column to a project' })
  @Post('projects/:projectId/columns')
  addColumn(
    @Param('projectId') projectId: string,
    @Body('name') name: string,
    @Body('color') color: string,
    @Request() req,
  ) {
    return this.projectsService.addColumn(projectId, name, color || '#6366f1', req.user._id);
  }
}
