import { formatValidationErrors } from "#utils/format.js";
import { signupSchema, signinSchema } from "#vali/auth.validation.js";
import logger from "#config/logger..js";
import { db } from "#config/database.js";
import { users } from "#models/user.model.js";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { jwttoken } from "#utils/jwt.js";
import { cookies } from "#utils/cookies.js";

export const signup = async (req, res, next) => {
    try {
        const validationResult = signupSchema.safeParse(req);

        if (!validationResult.success) {
            const formattedErrors = formatValidationErrors(validationResult.error);
            return res.status(400).json({ errors: formattedErrors });
        }


        const { name, email, password, role } = validationResult.data.body;
        const normalizedEmail = email.toLowerCase();
        const existingUser = await db.select({ id: users.id }).from(users).where(eq(users.email, normalizedEmail)).limit(1);

        if (existingUser.length > 0) {
            return res.status(409).json({ error: 'User with this email already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 12);
        const [user] = await db.insert(users).values({
            name,
            email: normalizedEmail,
            password: hashedPassword,
            role,
        }).returning({ id: users.id, name: users.name, email: users.email, role: users.role });

        const token = jwttoken.sign({ id: user.id, email: user.email, role: user.role });
        cookies.set(res, 'auth_token', token);

        logger.info(`User signed up: ${normalizedEmail}`);
        return res.status(201).json({ user });

    } catch (error) {
        logger.error('Error in signup controller', { error });
        next(error);

    }
};

export const signin = async (req, res, next) => {
    try {
        const validationResult = signinSchema.safeParse(req);

        if (!validationResult.success) {
            return res.status(400).json({ errors: formatValidationErrors(validationResult.error) });
        }

        const { email, password } = validationResult.data.body;
        const normalizedEmail = email.toLowerCase();
        const [user] = await db.select().from(users).where(eq(users.email, normalizedEmail)).limit(1);

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const token = jwttoken.sign({ id: user.id, email: user.email, role: user.role });
        cookies.set(res, 'auth_token', token);

        return res.status(200).json({
            user: { id: user.id, name: user.name, email: user.email, role: user.role },
        });
    } catch (error) {
        logger.error('Error in signin controller', { error });
        next(error);
    }
};

export const signout = (req, res) => {
    cookies.clear(res, 'auth_token');
    return res.status(204).send();
};