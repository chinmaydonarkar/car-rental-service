import { UserModel } from '../infrastructure/UserModel';
import { User, CreateUserRequest } from '../domain/User';

export class UserService {
  async createUser(userData: CreateUserRequest): Promise<User> {
    const licenseValidUntil = new Date(userData.licenseValidUntil);
    
    // Check if user with same email or license already exists
    const existingUser = await UserModel.findOne({
      $or: [
        { email: userData.email },
        { licenseNumber: userData.licenseNumber }
      ]
    });

    if (existingUser) {
      throw new Error('User with this email or license number already exists');
    }

    const user = new UserModel({
      name: userData.name,
      email: userData.email,
      licenseNumber: userData.licenseNumber,
      licenseValidUntil
    });

    const savedUser = await user.save();
    return savedUser.toObject() as User;
  }

  async getUserByLicense(licenseNumber: string): Promise<User | null> {
    const user = await UserModel.findOne({ licenseNumber });
    return user ? user.toObject() as User : null;
  }

  async getAllUsers(): Promise<User[]> {
    const users = await UserModel.find().sort({ name: 1 });
    return users.map(user => user.toObject() as User);
  }
} 