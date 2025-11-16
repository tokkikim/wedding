/**
 * 프로덕션 배포 준비 상태 검증 스크립트
 *
 * 사용법: npx tsx scripts/verify-production.ts
 */

import * as fs from 'fs';
import * as path from 'path';

interface CheckResult {
  name: string;
  passed: boolean;
  message: string;
  severity: 'critical' | 'warning' | 'info';
}

const results: CheckResult[] = [];

// 색상 코드
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function addResult(result: CheckResult) {
  results.push(result);
}

function printResults() {
  console.log('\n' + '='.repeat(70));
  console.log(`${colors.cyan}프로덕션 배포 준비 상태 검증${colors.reset}`);
  console.log('='.repeat(70) + '\n');

  const critical = results.filter(r => !r.passed && r.severity === 'critical');
  const warnings = results.filter(r => !r.passed && r.severity === 'warning');
  const passed = results.filter(r => r.passed);

  results.forEach(result => {
    const icon = result.passed ? '✅' : '❌';
    const color = result.passed
      ? colors.green
      : result.severity === 'critical'
        ? colors.red
        : colors.yellow;

    console.log(`${icon} ${color}${result.name}${colors.reset}`);
    console.log(`   ${result.message}\n`);
  });

  console.log('='.repeat(70));
  console.log(`${colors.green}통과: ${passed.length}${colors.reset} | ${colors.yellow}경고: ${warnings.length}${colors.reset} | ${colors.red}실패: ${critical.length}${colors.reset}`);
  console.log('='.repeat(70) + '\n');

  if (critical.length > 0) {
    console.log(`${colors.red}🚨 ${critical.length}개의 치명적 문제가 발견되었습니다. 프로덕션 배포 전 반드시 해결해야 합니다.${colors.reset}\n`);
    process.exit(1);
  } else if (warnings.length > 0) {
    console.log(`${colors.yellow}⚠️  ${warnings.length}개의 경고가 있습니다. 검토를 권장합니다.${colors.reset}\n`);
  } else {
    console.log(`${colors.green}✨ 모든 검사를 통과했습니다! 프로덕션 배포 준비가 완료되었습니다.${colors.reset}\n`);
  }
}

// 1. Prisma 스키마 검증
function checkPrismaSchema() {
  const schemaPath = path.join(process.cwd(), 'prisma', 'schema.prisma');

  if (!fs.existsSync(schemaPath)) {
    addResult({
      name: 'Prisma 스키마 존재',
      passed: false,
      message: 'prisma/schema.prisma 파일을 찾을 수 없습니다.',
      severity: 'critical',
    });
    return;
  }

  const schema = fs.readFileSync(schemaPath, 'utf-8');

  // PostgreSQL 사용 확인
  if (schema.includes('provider = "postgresql"')) {
    addResult({
      name: 'PostgreSQL 설정',
      passed: true,
      message: 'Prisma가 PostgreSQL을 사용하도록 설정되어 있습니다.',
      severity: 'info',
    });
  } else {
    addResult({
      name: 'PostgreSQL 설정',
      passed: false,
      message: 'Prisma가 SQLite를 사용하고 있습니다. 프로덕션에서는 PostgreSQL을 사용해야 합니다.',
      severity: 'critical',
    });
  }

  // 환경 변수 사용 확인
  if (schema.includes('env("DATABASE_URL")')) {
    addResult({
      name: 'DATABASE_URL 환경 변수 사용',
      passed: true,
      message: 'DATABASE_URL이 환경 변수로 설정되어 있습니다.',
      severity: 'info',
    });
  } else {
    addResult({
      name: 'DATABASE_URL 환경 변수 사용',
      passed: false,
      message: 'DATABASE_URL이 하드코딩되어 있습니다. 환경 변수를 사용해야 합니다.',
      severity: 'critical',
    });
  }
}

// 2. 환경 변수 검증
function checkEnvironmentVariables() {
  const requiredVars = [
    'DATABASE_URL',
    'NEXTAUTH_SECRET',
    'NEXTAUTH_URL',
  ];

  const recommendedVars = [
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET',
    'KAKAO_CLIENT_ID',
    'KAKAO_CLIENT_SECRET',
    'GEMINI_API_KEY',
    'CLOUDINARY_CLOUD_NAME',
    'CLOUDINARY_API_KEY',
    'CLOUDINARY_API_SECRET',
    'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
    'STRIPE_SECRET_KEY',
    'STRIPE_WEBHOOK_SECRET',
  ];

  const missingRequired = requiredVars.filter(v => !process.env[v]);
  const missingRecommended = recommendedVars.filter(v => !process.env[v]);

  if (missingRequired.length === 0) {
    addResult({
      name: '필수 환경 변수',
      passed: true,
      message: '모든 필수 환경 변수가 설정되어 있습니다.',
      severity: 'info',
    });
  } else {
    addResult({
      name: '필수 환경 변수',
      passed: false,
      message: `누락된 필수 환경 변수: ${missingRequired.join(', ')}`,
      severity: 'critical',
    });
  }

  if (missingRecommended.length === 0) {
    addResult({
      name: '권장 환경 변수',
      passed: true,
      message: '모든 권장 환경 변수가 설정되어 있습니다.',
      severity: 'info',
    });
  } else {
    addResult({
      name: '권장 환경 변수',
      passed: false,
      message: `누락된 권장 환경 변수 (${missingRecommended.length}개): ${missingRecommended.slice(0, 3).join(', ')}${missingRecommended.length > 3 ? '...' : ''}`,
      severity: 'warning',
    });
  }

  // TEST_SESSION_USER_ID 프로덕션 체크
  if (process.env.NODE_ENV === 'production' && process.env.TEST_SESSION_USER_ID) {
    addResult({
      name: 'TEST_SESSION_USER_ID 검증',
      passed: false,
      message: '프로덕션에서 TEST_SESSION_USER_ID가 설정되어 있습니다. 보안상 제거해야 합니다.',
      severity: 'critical',
    });
  } else {
    addResult({
      name: 'TEST_SESSION_USER_ID 검증',
      passed: true,
      message: 'TEST_SESSION_USER_ID가 프로덕션에 설정되지 않았습니다.',
      severity: 'info',
    });
  }
}

// 3. Next.js 설정 검증
function checkNextConfig() {
  const configPath = path.join(process.cwd(), 'next.config.ts');

  if (!fs.existsSync(configPath)) {
    addResult({
      name: 'Next.js 설정 파일',
      passed: false,
      message: 'next.config.ts 파일을 찾을 수 없습니다.',
      severity: 'critical',
    });
    return;
  }

  const config = fs.readFileSync(configPath, 'utf-8');

  // 보안 헤더 확인
  if (config.includes('X-Frame-Options') && config.includes('X-Content-Type-Options')) {
    addResult({
      name: '보안 헤더 설정',
      passed: true,
      message: '보안 헤더(X-Frame-Options, X-Content-Type-Options)가 설정되어 있습니다.',
      severity: 'info',
    });
  } else {
    addResult({
      name: '보안 헤더 설정',
      passed: false,
      message: '보안 헤더가 설정되지 않았습니다.',
      severity: 'warning',
    });
  }
}

// 4. 패키지 버전 검증
function checkPackageVersions() {
  const packagePath = path.join(process.cwd(), 'package.json');

  if (!fs.existsSync(packagePath)) {
    addResult({
      name: 'package.json 존재',
      passed: false,
      message: 'package.json 파일을 찾을 수 없습니다.',
      severity: 'critical',
    });
    return;
  }

  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf-8'));

  // NextAuth 버전 확인
  const nextAuthVersion = packageJson.dependencies['next-auth'];
  if (nextAuthVersion && nextAuthVersion.includes('5.0.0')) {
    addResult({
      name: 'NextAuth v5 버전',
      passed: true,
      message: `NextAuth v5가 설치되어 있습니다 (${nextAuthVersion}).`,
      severity: 'info',
    });
  } else {
    addResult({
      name: 'NextAuth v5 버전',
      passed: false,
      message: 'NextAuth v5가 설치되지 않았습니다. Cookie 취약점이 해결되지 않았을 수 있습니다.',
      severity: 'critical',
    });
  }

  // Next.js 버전 확인
  const nextVersion = packageJson.dependencies['next'];
  if (nextVersion && parseFloat(nextVersion.replace(/[^\d.]/g, '')) >= 15) {
    addResult({
      name: 'Next.js 버전',
      passed: true,
      message: `Next.js 15 이상이 설치되어 있습니다 (${nextVersion}).`,
      severity: 'info',
    });
  } else {
    addResult({
      name: 'Next.js 버전',
      passed: false,
      message: 'Next.js 15 이상을 사용해야 합니다.',
      severity: 'warning',
    });
  }
}

// 5. 파일 존재 확인
function checkRequiredFiles() {
  const requiredFiles = [
    'src/lib/auth.ts',
    'src/lib/env.ts',
    'src/instrumentation.ts',
    'SECURITY_AUDIT.md',
    'DEPLOYMENT_CHECKLIST.md',
    '.env.example',
  ];

  const missingFiles = requiredFiles.filter(f => !fs.existsSync(path.join(process.cwd(), f)));

  if (missingFiles.length === 0) {
    addResult({
      name: '필수 파일 존재',
      passed: true,
      message: '모든 필수 파일이 존재합니다.',
      severity: 'info',
    });
  } else {
    addResult({
      name: '필수 파일 존재',
      passed: false,
      message: `누락된 파일: ${missingFiles.join(', ')}`,
      severity: 'warning',
    });
  }
}

// 메인 실행
async function main() {
  console.log(`${colors.cyan}\n프로덕션 배포 준비 상태 검증을 시작합니다...\n${colors.reset}`);

  checkPrismaSchema();
  checkEnvironmentVariables();
  checkNextConfig();
  checkPackageVersions();
  checkRequiredFiles();

  printResults();
}

main().catch(console.error);
