import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { RegisterDto } from './register.dto';

describe('RegisterDto', () => {
  it('should validate a valid register dto', async () => {
    const dto = plainToInstance(RegisterDto, {
      email: 'user@example.com',
      password: 'Password123!',
      firstName: 'John',
      lastName: 'Doe',
    });

    const errors = await validate(dto);

    expect(errors.length).toBe(0);
  });

  it('should reject invalid email', async () => {
    const dto = plainToInstance(RegisterDto, {
      email: 'not-an-email',
      password: 'Password123!',
    });

    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('email');
  });

  it('should reject short password', async () => {
    const dto = plainToInstance(RegisterDto, {
      email: 'user@example.com',
      password: 'short',
    });

    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('password');
  });

  it('should reject missing email', async () => {
    const dto = plainToInstance(RegisterDto, {
      password: 'Password123!',
    });

    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
  });

  it('should reject missing password', async () => {
    const dto = plainToInstance(RegisterDto, {
      email: 'user@example.com',
    });

    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
  });
});