import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

interface SubjectData {
  name: string;
  description: string;
  topicName: string;
}

interface SubjectsJsonData {
  data: SubjectData[];
}

export async function subjectsSeed() {
  const subjectsPath = path.resolve(__dirname, 'data', 'subjects.json');
  const subjectsRaw = fs.readFileSync(subjectsPath, 'utf-8');
  const subjectsJson = JSON.parse(subjectsRaw) as SubjectsJsonData;
  const subjects = subjectsJson.data;

  const topics = await prisma.topic.findMany();

  for (const subject of subjects) {
    const topic = topics.find((t) => t.name === subject.topicName);
    if (!topic) {
      console.warn(`Topic not found for subject: ${subject.name}`);
      continue;
    }

    const existingSubject = await prisma.subject.findFirst({
      where: {
        name: subject.name,
        topicId: topic.id,
      },
    });
    if (!existingSubject) {
      await prisma.subject.create({
        data: {
          name: subject.name,
          description: subject.description,
          topicId: topic.id,
        },
      });
      console.log('memasukan object baru subject:', subject.name);
    } else {
      console.log('subject sudah ada:', subject.name);
    }
  }
}

if (require.main === module) {
  subjectsSeed()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(() => {
      void prisma.$disconnect();
    });
}
