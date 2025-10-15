/**
 * 빠른 데이터 확인 스크립트
 * 실행: npx ts-node scripts/quick-check.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const command = process.argv[2] || 'stats';

  switch (command) {
    case 'stats':
      // 전체 통계
      const userCount = await prisma.user.count();
      const accountCount = await prisma.account.count();
      const sessionCount = await prisma.session.count();
      const orderCount = await prisma.order.count();
      const imageCount = await prisma.generatedImage.count();

      console.log('\n📊 데이터베이스 통계');
      console.log('─'.repeat(40));
      console.log(`👥 사용자: ${userCount}명`);
      console.log(`📱 계정 연결: ${accountCount}개`);
      console.log(`🔐 활성 세션: ${sessionCount}개`);
      console.log(`💰 주문: ${orderCount}건`);
      console.log(`🖼️  생성 이미지: ${imageCount}개\n`);
      break;

    case 'users':
      // 사용자 목록 (간단)
      const users = await prisma.user.findMany({
        select: {
          id: true,
          email: true,
          name: true,
          credits: true,
          createdAt: true,
        }
      });

      console.log('\n👥 사용자 목록');
      console.log('─'.repeat(60));
      users.forEach((user) => {
        console.log(`${user.email} | ${user.name || '이름없음'} | ${user.credits}크레딧`);
      });
      console.log('');
      break;

    case 'recent':
      // 최근 활동
      const recentImages = await prisma.generatedImage.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { email: true } } }
      });

      console.log('\n🕒 최근 이미지 생성 (10개)');
      console.log('─'.repeat(60));
      recentImages.forEach((img) => {
        console.log(`${img.createdAt.toLocaleString('ko-KR')} | ${img.user.email} | ${img.status}`);
      });
      console.log('');
      break;

    default:
      console.log('\n사용법:');
      console.log('  npx ts-node scripts/quick-check.ts stats   # 전체 통계');
      console.log('  npx ts-node scripts/quick-check.ts users   # 사용자 목록');
      console.log('  npx ts-node scripts/quick-check.ts recent  # 최근 활동\n');
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ 에러:', e);
    await prisma.$disconnect();
    process.exit(1);
  });

