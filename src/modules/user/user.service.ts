import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(email: string, hashedPassword: string) {
    const user = this.userRepository.create({
      email: this.standardizeEmail(email),
      password: hashedPassword,
    });
    return await this.userRepository.save(user);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email: this.standardizeEmail(email), deletedAt: IsNull() },
    });
  }

  async findByEmailWithPassword(email: string) {
    return await this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.email = :email', {
        email: this.standardizeEmail(email),
      })
      .andWhere('user.deletedAt IS NULL')
      .getOne();
  }

  private standardizeEmail(email: string) {
    return email.trim().toLowerCase();
  }
}
