import 'dotenv/config.js';
import { prisma } from './config/database.js';
import { hashPassword } from './utils/password.js';

interface UserSeed {
  email: string;
  username: string;
  password: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'TEACHER' | 'STUDENT' | 'PARENT' | 'GUEST';
  firstName: string;
  lastName: string;
  displayName?: string;
  currentClass?: string;
  academicYear?: string;
  schoolName?: string;
}

async function seed() {
  try {
    const usersToCreate: UserSeed[] = [
      // Super Admin
      {
        email: process.env.SUPER_ADMIN_EMAIL || 'superadmin@testscorelat.com',
        username: 'superadmin',
        password: process.env.SUPER_ADMIN_PASSWORD || 'SecureAdmin#2024Pass123',
        role: 'SUPER_ADMIN',
        firstName: 'Super',
        lastName: 'Admin',
        displayName: 'Super Admin',
      },

      // Admin
      {
        email: 'admin@testscorelat.com',
        username: 'admin',
        password: 'AdminPass#2024',
        role: 'ADMIN',
        firstName: 'Admin',
        lastName: 'User',
        displayName: 'System Administrator',
      },

      // Teachers
      {
        email: 'john.teacher@testscorelat.com',
        username: 'john_teacher',
        password: 'TeacherPass#2024',
        role: 'TEACHER',
        firstName: 'John',
        lastName: 'Teacher',
        displayName: 'John Teacher',
        schoolName: 'Central Public School',
      },
      {
        email: 'sarah.teacher@testscorelat.com',
        username: 'sarah_teacher',
        password: 'TeacherPass#2024',
        role: 'TEACHER',
        firstName: 'Sarah',
        lastName: 'Williams',
        displayName: 'Sarah Williams',
        schoolName: 'Central Public School',
      },
      {
        email: 'michael.teacher@testscorelat.com',
        username: 'michael_teacher',
        password: 'TeacherPass#2024',
        role: 'TEACHER',
        firstName: 'Michael',
        lastName: 'Chen',
        displayName: 'Michael Chen',
        schoolName: 'Modern Academy',
      },

      // Students
      {
        email: 'jane.student@testscorelat.com',
        username: 'jane_student',
        password: 'StudentPass#2024',
        role: 'STUDENT',
        firstName: 'Jane',
        lastName: 'Doe',
        displayName: 'Jane Doe',
        currentClass: '12A',
        academicYear: '2024',
        schoolName: 'Central Public School',
      },
      {
        email: 'alex.student@testscorelat.com',
        username: 'alex_student',
        password: 'StudentPass#2024',
        role: 'STUDENT',
        firstName: 'Alex',
        lastName: 'Johnson',
        displayName: 'Alex Johnson',
        currentClass: '11B',
        academicYear: '2024',
        schoolName: 'Central Public School',
      },
      {
        email: 'priya.student@testscorelat.com',
        username: 'priya_student',
        password: 'StudentPass#2024',
        role: 'STUDENT',
        firstName: 'Priya',
        lastName: 'Sharma',
        displayName: 'Priya Sharma',
        currentClass: '12C',
        academicYear: '2024',
        schoolName: 'Modern Academy',
      },
      {
        email: 'raj.student@testscorelat.com',
        username: 'raj_student',
        password: 'StudentPass#2024',
        role: 'STUDENT',
        firstName: 'Raj',
        lastName: 'Kumar',
        displayName: 'Raj Kumar',
        currentClass: '10A',
        academicYear: '2024',
        schoolName: 'Modern Academy',
      },
      {
        email: 'emma.student@testscorelat.com',
        username: 'emma_student',
        password: 'StudentPass#2024',
        role: 'STUDENT',
        firstName: 'Emma',
        lastName: 'Watson',
        displayName: 'Emma Watson',
        currentClass: '11A',
        academicYear: '2024',
        schoolName: 'Central Public School',
      },

      // Parents
      {
        email: 'robert.parent@testscorelat.com',
        username: 'robert_parent',
        password: 'ParentPass#2024',
        role: 'PARENT',
        firstName: 'Robert',
        lastName: 'Doe',
        displayName: 'Robert Doe',
      },
      {
        email: 'maria.parent@testscorelat.com',
        username: 'maria_parent',
        password: 'ParentPass#2024',
        role: 'PARENT',
        firstName: 'Maria',
        lastName: 'Johnson',
        displayName: 'Maria Johnson',
      },
      {
        email: 'deepak.parent@testscorelat.com',
        username: 'deepak_parent',
        password: 'ParentPass#2024',
        role: 'PARENT',
        firstName: 'Deepak',
        lastName: 'Sharma',
        displayName: 'Deepak Sharma',
      },

      // Guest
      {
        email: 'guest@testscorelat.com',
        username: 'guest',
        password: 'GuestPass#2024',
        role: 'GUEST',
        firstName: 'Guest',
        lastName: 'User',
        displayName: 'Guest Visitor',
      },
    ];

    console.log('🌱 Starting database seeding...\n');

    for (const userData of usersToCreate) {
      const existingUser = await prisma.user.findUnique({
        where: { email: userData.email },
      });

      if (existingUser) {
        console.log(`✓ User already exists: ${userData.email} (${userData.role})`);
        continue;
      }

      const hashedPassword = await hashPassword(userData.password);

      const user = await prisma.user.create({
        data: {
          email: userData.email,
          username: userData.username,
          password: hashedPassword,
          role: userData.role,
          emailVerified: true,
          profile: {
            create: {
              firstName: userData.firstName,
              lastName: userData.lastName,
              displayName: userData.displayName,
              currentClass: userData.currentClass,
              academicYear: userData.academicYear,
              schoolName: userData.schoolName,
            },
          },
          preferences: {
            create: {},
          },
        },
        include: {
          profile: true,
        },
      });

      console.log(`✓ User created: ${user.email}`);
      console.log(`  Role: ${user.role}`);
      console.log(`  Username: ${user.username}`);
      console.log(`  Password: ${userData.password}\n`);
    }

    console.log('✓ Seeding completed successfully!');
  } catch (error) {
    console.error('✗ Seeding failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seed();
