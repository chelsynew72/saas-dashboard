import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Org } from './schemas/org.schema';
import { User } from '../users/schemas/user.schema';

@Injectable()
export class OrgsService {
  constructor(
    @InjectModel(Org.name) private orgModel: Model<Org>,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  async create(name: string, userId: string) {
    const slug =
      name.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now();
    return this.orgModel.create({
      name,
      slug,
      ownerId: userId,
      members: [{ userId, role: 'owner', joinedAt: new Date() }],
    });
  }

  async getUserOrgs(userId: string) {
    return this.orgModel
      .find({ 'members.userId': new Types.ObjectId(userId) })
      .lean();
  }

  async getBySlug(slug: string, userId: string) {
    const org = await this.orgModel
      .findOne({ slug })
      .populate('members.userId', 'name email avatarUrl')
      .lean();
    if (!org) throw new NotFoundException('Org not found');
    const isMember = org.members.some(
      (m: any) =>
        (m.userId?._id || m.userId)?.toString() === userId.toString(),
    );
    if (!isMember) throw new ForbiddenException('Not a member');
    return org;
  }

  async getById(orgId: string, userId: string) {
    const org = await this.orgModel
      .findById(orgId)
      .populate('members.userId', 'name email avatarUrl')
      .lean();
    if (!org) throw new NotFoundException('Org not found');
    const isMember = org.members.some(
      (m: any) =>
        (m.userId?._id || m.userId)?.toString() === userId.toString(),
    );
    if (!isMember) throw new ForbiddenException('Not a member');
    return org;
  }

  async updateName(orgId: string, name: string, userId: string) {
    const org = await this.orgModel.findById(orgId);
    if (!org) throw new NotFoundException('Org not found');
    const member = org.members.find(
      (m) => m.userId.toString() === userId.toString(),
    );
    if (!member || member.role !== 'owner')
      throw new ForbiddenException('Only owner can rename org');
    return this.orgModel.findByIdAndUpdate(orgId, { name }, { new: true });
  }

  async inviteMember(orgId: string, email: string, role: string) {
    const invitee = await this.userModel.findOne({ email });
    if (!invitee) throw new NotFoundException('User not found');

    const org = await this.orgModel.findById(orgId);
    if (!org) throw new NotFoundException('Org not found');

    const alreadyMember = org.members.some(
      (m) => m.userId.toString() === invitee._id.toString(),
    );
    if (alreadyMember) throw new ForbiddenException('Already a member');

    await this.orgModel.findByIdAndUpdate(orgId, {
      $push: {
        members: { userId: invitee._id, role, joinedAt: new Date() },
      },
    });
    return { message: 'Member added successfully' };
  }

  async updateMemberRole(orgId: string, memberId: string, role: string) {
    await this.orgModel.updateOne(
      { _id: orgId, 'members.userId': memberId },
      { $set: { 'members.$.role': role } },
    );
    return { message: 'Role updated' };
  }

  async removeMember(orgId: string, memberId: string, requesterId: string) {
    const org = await this.orgModel.findById(orgId);
    if (!org) throw new NotFoundException('Org not found');
    if (org.ownerId.toString() === memberId)
      throw new ForbiddenException('Cannot remove the owner');

    await this.orgModel.updateOne(
      { _id: orgId },
      { $pull: { members: { userId: new Types.ObjectId(memberId) } } },
    );
    return { message: 'Member removed' };
  }
}
