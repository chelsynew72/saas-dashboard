import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type OrgMember = {
  userId: Types.ObjectId;
  role: 'owner' | 'admin' | 'member';
  joinedAt: Date;
};

@Schema({ timestamps: true })
export class Org extends Document {
  @Prop({ required: true }) name: string;
  @Prop({ required: true, unique: true }) slug: string;
  @Prop({ type: Types.ObjectId, ref: 'User' }) ownerId: Types.ObjectId;

  @Prop({
    type: [
      {
        userId: { type: Types.ObjectId, ref: 'User' },
        role: { type: String, enum: ['owner', 'admin', 'member'] },
        joinedAt: { type: Date, default: Date.now },
      },
    ],
  })
  members: OrgMember[];
}

export const OrgSchema = SchemaFactory.createForClass(Org);
