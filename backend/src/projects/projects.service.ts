import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Project } from './schemas/project.schema';
import { Org } from '../orgs/schemas/org.schema';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectModel(Project.name) private projectModel: Model<Project>,
    @InjectModel(Org.name) private orgModel: Model<Org>,
  ) {}

  private async checkMembership(orgId: string, userId: string) {
    const org = await this.orgModel.findById(orgId);
    if (!org) throw new NotFoundException('Org not found');
    const isMember = org.members.some(
      (m) => m.userId.toString() === userId.toString(),
    );
    if (!isMember) throw new ForbiddenException('Not a member of this org');
    return org;
  }

  async getOrgProjects(orgId: string, userId: string) {
    await this.checkMembership(orgId, userId);
    return this.projectModel.find({ orgId, status: 'active' }).lean();
  }

  async create(orgId: string, name: string, description: string, userId: string) {
    await this.checkMembership(orgId, userId);
    return this.projectModel.create({ orgId, name, description });
  }

  async getById(projectId: string, userId: string) {
    const project = await this.projectModel.findById(projectId);
    if (!project) throw new NotFoundException('Project not found');
    await this.checkMembership(project.orgId.toString(), userId);
    return project;
  }

  async update(projectId: string, dto: Partial<{ name: string; description: string }>, userId: string) {
    const project = await this.projectModel.findById(projectId);
    if (!project) throw new NotFoundException('Project not found');
    await this.checkMembership(project.orgId.toString(), userId);
    return this.projectModel.findByIdAndUpdate(projectId, dto, { new: true });
  }

  async archive(projectId: string, userId: string) {
    const project = await this.projectModel.findById(projectId);
    if (!project) throw new NotFoundException('Project not found');
    await this.checkMembership(project.orgId.toString(), userId);
    return this.projectModel.findByIdAndUpdate(
      projectId,
      { status: 'archived' },
      { new: true },
    );
  }

  async addColumn(projectId: string, name: string, color: string, userId: string) {
    const project = await this.projectModel.findById(projectId);
    if (!project) throw new NotFoundException('Project not found');
    await this.checkMembership(project.orgId.toString(), userId);
    const position = project.columns.length;
    return this.projectModel.findByIdAndUpdate(
      projectId,
      { $push: { columns: { _id: new Types.ObjectId(), name, color, position } } },
      { new: true },
    );
  }
}
