import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type Column = {
  _id: Types.ObjectId;
  name: string;
  position: number;
  color: string;
};

@Schema({ timestamps: true })
export class Project extends Document {
  @Prop({ required: true }) name: string;
  @Prop({ default: '' }) description: string;
  @Prop({ type: Types.ObjectId, ref: 'Org', required: true }) orgId: Types.ObjectId;
  @Prop({ enum: ['active', 'archived'], default: 'active' }) status: string;

  @Prop({
    type: [
      {
        _id: { type: Types.ObjectId, auto: true },
        name: String,
        position: Number,
        color: { type: String, default: '#6366f1' },
      },
    ],
    default: [
      { name: 'To Do', position: 0, color: '#6366f1' },
      { name: 'In Progress', position: 1, color: '#f59e0b' },
      { name: 'Done', position: 2, color: '#22c55e' },
    ],
  })
  columns: Column[];
}

export const ProjectSchema = SchemaFactory.createForClass(Project);
