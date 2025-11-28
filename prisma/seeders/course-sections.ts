import { PrismaClient } from '@prisma/client';
import * as fs from 'node:fs';
import * as path from 'node:path';

const prisma = new PrismaClient();

interface CourseSectionData {
  title: string;
  description?: string;
  courseTitle: string;
  orderIndex: number;
}

interface CourseSectionsJsonData {
  data: CourseSectionData[];
}

export async function courseSectionsSeed() {
  const courseSectionsPath = path.resolve(
    __dirname,
    'data',
    'course-sections.json',
  );
  const courseSectionsRaw = fs.readFileSync(courseSectionsPath, 'utf-8');
  const courseSectionsJson = JSON.parse(
    courseSectionsRaw,
  ) as CourseSectionsJsonData;
  const courseSections = courseSectionsJson.data;

  const courses = await prisma.course.findMany();

  for (const section of courseSections) {
    const course = courses.find((c) => c.title === section.courseTitle);

    if (!course) {
      console.warn(
        `Course not found for section: ${section.title}, course title: ${section.courseTitle}`,
      );
      continue;
    }
    const existingSections = await prisma.courseSection.findMany({
      where: {
        title: section.title,
        courseId: course.id,
      },
    });
    // FIX: Changed from if (!existingSections) to check array length
    if (existingSections.length === 0) {
      await prisma.courseSection.create({
        data: {
          title: section.title,
          description: section.description,
          orderIndex: section.orderIndex,
          courseId: course.id,
        },
      });
      console.log(`✅ Section seeded: ${section.title}`);
    } else {
      console.log(`⚠️  Section already exists. Skipping: ${section.title}`);
    }
  }
  console.log('Course sections seeding completed 🎉');
}

// For running directly
if (require.main === module) {
  courseSectionsSeed()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(() => {
      void prisma.$disconnect();
    });
}
