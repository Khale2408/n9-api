// src/services/authService.ts
import bcrypt from 'bcrypt';
import { customerRepository, NewCustomerData } from '../repositories/customerRepository'; // Sửa lại dòng import này
import { BadRequestError } from '../common/exceptions/apiError';

// Interface này không còn cần thiết ở đây nữa
// export interface NewCustomerData { ... }

interface RegisterPayload {
    full_name: string;
    email: string;
    password: string;
}

class AuthService {
    public async register(payload: RegisterPayload) {
        const { full_name, email, password } = payload;

        const existingCustomer = await customerRepository.findByEmail(email);
        if (existingCustomer) {
            throw new BadRequestError('Email already exists.');
        }

        const saltRounds = 10;
        const password_hash = await bcrypt.hash(password, saltRounds);

        // Dữ liệu truyền đi giờ phải khớp với interface NewCustomerData
        const customerToCreate: NewCustomerData = {
            full_name,
            email,
            password_hash
        };

        const newCustomer = await customerRepository.create(customerToCreate);

        return newCustomer;
    }
}

export const authService = new AuthService();