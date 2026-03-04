import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Org } from '../../orgs/schemas/org.schema';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @InjectModel(Org.name) private orgModel: Model<Org>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.get<string[]>(
      'roles',
      context.getHandler(),
    );
    if (!requiredRoles) return true;

    const { user, params } = context.switchToHttp().getRequest();
    const org = await this.orgModel.findById(params.orgId);
    if (!org) throw new ForbiddenException('Org not found');

    const member = org.members.find(
      (m) => m.userId.toString() === user._id.toString(),
    );
    if (!member) throw new ForbiddenException('Not a member of this org');
    if (!requiredRoles.includes(member.role))
      throw new ForbiddenException('Insufficient permissions');

    return true;
  }
}