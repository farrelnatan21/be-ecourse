import { CourseStatus, PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

interface CourseData {
  title: string;
  description?: string;
  about?: string;
  price: number;
  status: CourseStatus;
  subjectname: string;
  mentorEmail: string;
  keyPoints: string[];
  personas: string[];
  images: string[];
  reviews?: {
    studentEmail: string;
    rating: number;
    comment?: string;
  }[];
}

interface CoursesJsonData {
  data: CourseData[];
}

export async function coursesSeed() {
  const coursesPath = path.resolve(__dirname, 'data', 'courses.json');
  const coursesRaw = fs.readFileSync(coursesPath, 'utf-8');
  const coursesJson = JSON.parse(coursesRaw) as CoursesJsonData;
  const courses = coursesJson.data;

  const subjects = await prisma.subject.findMany();
  const users = await prisma.user.findMany();

  for (const course of courses) {
    const subject = subjects.find((s) => s.name === course.subjectname);
    if (!subject) {
      console.warn(
        `Subject not found for course: ${course.title}, subject name: ${course.subjectname}`,
      );
      continue;
    }
    const mentor = users.find((u) => u.email === course.mentorEmail);
    if (!mentor) {
      console.warn(
        `Mentor not found for course: ${course.title}, mentor email: ${course.mentorEmail}`,
      );
      continue;
    }

    const existingCourse = await prisma.course.findFirst({
      where: {
        title: course.title,
        subjectId: subject.id,
        mentorId: mentor.id,
      },
    });
    if (!existingCourse) {
      await prisma.$transaction(async (prisma) => {
        const createdCourse = await prisma.course.create({
          data: {
            title: course.title,
            description: course.description,
            about: course.about,
            price: course.price,
            status: course.status,
            subjectId: subject.id,
            mentorId: mentor.id,
          },
        });
        if (course.keyPoints && course.keyPoints.length > 0) {
          await prisma.courseKeyPoint.createMany({
            data: course.keyPoints.map((point) => ({
              keyPoint: point,
              courseId: createdCourse.id,
            })),
            skipDuplicates: true,
          });
        }
        if (course.personas && course.personas.length > 0) {
          await prisma.coursePersona.createMany({
            data: course.personas.map((persona) => ({
              persona,
              courseId: createdCourse.id,
            })),
          });
        }
        if (course.images && course.images.length > 0) {
          await prisma.courseImage.createMany({
            data: course.images.map((imageUrl) => ({
              imagePath: imageUrl,
              courseId: createdCourse.id,
            })),
            skipDuplicates: true,
          });
        }
        if (course.reviews && course.reviews.length < 0) {
          for (const review of course.reviews) {
            const student = users.find((u) => u.email === review.studentEmail);

            if (student) {
              await prisma.courseReview.create({
                data: {
                  rating: review.rating,
                  reviewText: review.comment,
                  courseId: createdCourse.id,
                  studentId: student.id,
                },
              });
            } else {
              console.warn(
                `Student not found for review in course: ${course.title}, student email: ${review.studentEmail}`,
              );
            }
          }
        }
      });
      console.log('memasukan object baru course:', course.title);
    } else {
      console.log('course sudah ada:', course.title);
    }
  }
}

if (require.main === module) {
  coursesSeed()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(() => {
      void prisma.$disconnect();
    });
}
