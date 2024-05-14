import { CollectionNames } from '@/app/common';
import { updateVersionPlugin } from '@/infra/common';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema({ collection: CollectionNames.USER, versionKey: 'version' })
export class UserDocument {
  _id: Types.ObjectId;

  @Prop({ required: true, type: String })
  name: string;

  @Prop({ required: true, type: String, unique: true })
  email: string;

  @Prop({ required: true, type: Date })
  created_at: Date;

  @Prop({ required: false, type: String })
  profile_picture_url: string | null;

  @Prop({ required: false, type: Date })
  updated_at?: Date;

  @Prop({ required: false, type: Date })
  deleted_at?: Date;

  @Prop({ required: true, type: Number, default: 0 })
  version: number;
}

export const UserSchema = SchemaFactory.createForClass(UserDocument).plugin(updateVersionPlugin);
