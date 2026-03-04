import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { User } from '../users/schemas/user.schema';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private jwtService: JwtService,
  ) {}

  async register(name: string, email: string, password: string) {
    const exists = await this.userModel.findOne({ email });
    if (exists) throw new ConflictException('Email already in use');

    const hashed = await bcrypt.hash(password, 10);
    const user = await this.userModel.create({ name, email, password: hashed });

    const token = this.jwtService.sign({ sub: user._id, email: user.email });
    return {
      token,
      user: { id: user._id, name: user.name, email: user.email },
    };
  }

  async login(email: string, password: string) {
    const user = await this.userModel.findOne({ email });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    const token = this.jwtService.sign({ sub: user._id, email: user.email });
    return {
      token,
      user: { id: user._id, name: user.name, email: user.email },
    };
  }
}