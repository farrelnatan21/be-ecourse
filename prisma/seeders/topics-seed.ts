import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

interface TopicData {
  name: string;
  description: string;
}

interface TopicsJsonData {
  data: TopicData[];
}

export async function topicsSeed() {
  const topicsPath = path.resolve(__dirname, 'data', 'topics.json');
  const topicsRaw = fs.readFileSync(topicsPath, 'utf-8');
  const topicsJson = JSON.parse(topicsRaw) as TopicsJsonData;
  const topics = topicsJson.data;

  const existingTopics = await prisma.topic.findMany({
    where: {
      name: {
        in: topics.map((t) => t.name),
      },
    },
  });

  const existingTopicNames = existingTopics.map((t) => t.name);
  // FIX: Changed .includes() to !.includes() - we want topics that DON'T exist yet
  const newTopics = topics.filter((t) => !existingTopicNames.includes(t.name));
  // FIX: Changed condition from === 0 to > 0 - we want to insert when we HAVE new topics
  if (newTopics.length > 0) {
    await prisma.topic.createMany({
      data: newTopics,
      skipDuplicates: true,
    });
    console.log(`✅ ${newTopics.length} new topics seeded`);
  } else {
    console.log('⚠️  All topics already exist, skipping...');
  }
  console.log('Topics seeding completed 🎉');
}

if (require.main === module) {
  topicsSeed()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(() => {
      void prisma.$disconnect();
    });
}
