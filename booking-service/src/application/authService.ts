import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { UserModel } from '../infrastructure/UserModel';
import { CreateUserRequest, LoginRequest, LoginResponse, AuthUser } from '../domain/User';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const SALT_ROUNDS = 10;

export class AuthService {
  async register(userData: CreateUserRequest): Promise<AuthUser> {
    // Check if user already exists
    const existingUser = await UserModel.findOne({ 
      $or: [{ email: userData.email }, { licenseNumber: userData.licenseNumber }] 
    });
    
    if (existingUser) {
      throw new Error('User with this email or license number already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(userData.password, SALT_ROUNDS);

    // Create user
    const user = new UserModel({
      ...userData,
      password: hashedPassword,
      licenseValidUntil: new Date(userData.licenseValidUntil)
    });

    const savedUser = await user.save();
    
    // Return user without password
    const { password, ...userWithoutPassword } = savedUser.toObject();
    return userWithoutPassword as AuthUser;
  }

  async login(loginData: LoginRequest): Promise<LoginResponse> {
    // Find user by email
    const user = await UserModel.findOne({ email: loginData.email.toLowerCase() });
    
    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(loginData.password, user.password);
    
    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Return user without password
    const { password, ...userWithoutPassword } = user.toObject();
    
    return {
      user: userWithoutPassword as AuthUser,
      token
    };
  }

  async getUserById(userId: string): Promise<AuthUser | null> {
    const user = await UserModel.findById(userId).select('-password');
    return user as AuthUser | null;
  }

  verifyToken(token: string): { userId: string; email: string } {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string };
      return decoded;
    } catch (error) {
      throw new Error('Invalid token');
    }
  }
} 