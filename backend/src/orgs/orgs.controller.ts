import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { OrgsService } from './orgs.service';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';

@ApiTags('orgs')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('orgs')
export class OrgsController {
  constructor(private orgsService: OrgsService) {}

  @ApiOperation({ summary: 'Create a new organization' })
  @Post()
  create(@Body('name') name: string, @Request() req) {
    return this.orgsService.create(name, req.user._id);
  }

  @ApiOperation({ summary: 'Get all orgs for current user' })
  @Get()
  getUserOrgs(@Request() req) {
    return this.orgsService.getUserOrgs(req.user._id);
  }

  @ApiOperation({ summary: 'Get org by slug' })
  @Get('slug/:slug')
  getBySlug(@Param('slug') slug: string, @Request() req) {
    return this.orgsService.getBySlug(slug, req.user._id);
  }

  @ApiOperation({ summary: 'Get org by id' })
  @Get(':orgId')
  getById(@Param('orgId') orgId: string, @Request() req) {
    return this.orgsService.getById(orgId, req.user._id);
  }

  @ApiOperation({ summary: 'Update org name' })
  @Patch(':orgId')
  update(
    @Param('orgId') orgId: string,
    @Body('name') name: string,
    @Request() req,
  ) {
    return this.orgsService.updateName(orgId, name, req.user._id);
  }

  @ApiOperation({ summary: 'Invite a member by email' })
  @Post(':orgId/invite')
  invite(
    @Param('orgId') orgId: string,
    @Body('email') email: string,
    @Body('role') role: string,
  ) {
    return this.orgsService.inviteMember(orgId, email, role || 'member');
  }

  @ApiOperation({ summary: 'Update a member role' })
  @Patch(':orgId/members/:memberId/role')
  updateRole(
    @Param('orgId') orgId: string,
    @Param('memberId') memberId: string,
    @Body('role') role: string,
  ) {
    return this.orgsService.updateMemberRole(orgId, memberId, role);
  }

  @ApiOperation({ summary: 'Remove a member' })
  @Delete(':orgId/members/:memberId')
  removeMember(
    @Param('orgId') orgId: string,
    @Param('memberId') memberId: string,
    @Request() req,
  ) {
    return this.orgsService.removeMember(orgId, memberId, req.user._id);
  }
}
