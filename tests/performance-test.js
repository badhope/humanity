/**
 * HumanOS 网站性能测试脚本
 * 使用 Node.js 内置模块和 HTTP 请求模拟并发测试
 *
 * 运行方式:
 * node tests/performance-test.js
 */

const http = require('http');
const https = require('https');
const url = require('url');

const BASE_URL = 'https://badhope.github.io/HumanOS';
const CONCURRENT_USERS = 10;
const REQUESTS_PER_USER = 5;
const DELAY_BETWEEN_REQUESTS = 1000;

const results = {
  totalRequests: 0,
  successfulRequests: 0,
  failedRequests: 0,
  totalTime: 0,
  responseTimes: [],
  errors: [],
};

function makeRequest(path) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(BASE_URL + path);
    const protocol = parsedUrl.protocol === 'https:' ? https : http;

    const startTime = Date.now();

    const req = protocol.get(parsedUrl, { timeout: 10000 }, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        const responseTime = Date.now() - startTime;
        results.totalRequests++;
        results.responseTimes.push(responseTime);

        if (res.statusCode >= 200 && res.statusCode < 400) {
          results.successfulRequests++;
          resolve({
            status: res.statusCode,
            responseTime,
            path,
            success: true,
          });
        } else {
          results.failedRequests++;
          results.errors.push({
            path,
            status: res.statusCode,
            responseTime,
          });
          reject(new Error(`HTTP ${res.statusCode}`));
        }
      });
    });

    req.on('error', (err) => {
      results.totalRequests++;
      results.failedRequests++;
      results.errors.push({
        path,
        error: err.message,
      });
      reject(err);
    });

    req.on('timeout', () => {
      req.destroy();
      results.totalRequests++;
      results.failedRequests++;
      const error = new Error('Request timeout');
      results.errors.push({
        path,
        error: 'Request timeout',
      });
      reject(error);
    });
  });
}

async function simulateUser(userId) {
  const routes = [
    '/',
    '/#/categories',
    '/#/assessments/personality',
    '/#/quiz/mbti-basic',
    '/#/maintenance',
  ];

  for (let i = 0; i < REQUESTS_PER_USER; i++) {
    const route = routes[i % routes.length];

    try {
      const result = await makeRequest(route);
      console.log(
        `[User ${userId}] ✓ ${route} - ${result.status} (${result.responseTime}ms)`
      );
    } catch (err) {
      console.log(`[User ${userId}] ✗ ${route} - ${err.message}`);
    }

    await new Promise((resolve) => setTimeout(resolve, DELAY_BETWEEN_REQUESTS));
  }
}

function calculateStats() {
  const responseTimes = results.responseTimes.sort((a, b) => a - b);
  const count = responseTimes.length;

  const avg = responseTimes.reduce((a, b) => a + b, 0) / count;
  const min = responseTimes[0];
  const max = responseTimes[count - 1];
  const median = responseTimes[Math.floor(count / 2)];
  const p95 = responseTimes[Math.floor(count * 0.95)];
  const p99 = responseTimes[Math.floor(count * 0.99)];

  const successRate = ((results.successfulRequests / results.totalRequests) * 100).toFixed(2);
  const failuresPerSecond = (results.failedRequests / (results.totalTime / 1000)).toFixed(4);
  const requestsPerSecond = (results.totalRequests / (results.totalTime / 1000)).toFixed(2);

  return {
    avg: avg.toFixed(2),
    min: min.toFixed(2),
    max: max.toFixed(2),
    median: median.toFixed(2),
    p95: p95.toFixed(2),
    p99: p99.toFixed(2),
    successRate,
    failuresPerSecond,
    requestsPerSecond,
  };
}

async function runLoadTest() {
  console.log('========================================');
  console.log('     HumanOS 网站性能测试报告');
  console.log('========================================');
  console.log(`目标地址: ${BASE_URL}`);
  console.log(`并发用户: ${CONCURRENT_USERS}`);
  console.log(`每用户请求数: ${REQUESTS_PER_USER}`);
  console.log(`总请求数: ${CONCURRENT_USERS * REQUESTS_PER_USER}`);
  console.log('========================================\n');

  console.log('开始性能测试...\n');
  const startTime = Date.now();

  const userPromises = [];
  for (let i = 0; i < CONCURRENT_USERS; i++) {
    userPromises.push(simulateUser(i + 1));
  }

  await Promise.all(userPromises);
  results.totalTime = Date.now() - startTime;

  console.log('\n========================================');
  console.log('           测试结果汇总');
  console.log('========================================');

  const stats = calculateStats();

  console.log('\n📊 响应时间统计 (ms):');
  console.log(`   平均响应时间: ${stats.avg} ms`);
  console.log(`   最小响应时间: ${stats.min} ms`);
  console.log(`   最大响应时间: ${stats.max} ms`);
  console.log(`   中位数响应: ${stats.median} ms`);
  console.log(`   95%分位数: ${stats.p95} ms`);
  console.log(`   99%分位数: ${stats.p99} ms`);

  console.log('\n📈 请求统计:');
  console.log(`   总请求数: ${results.totalRequests}`);
  console.log(`   成功请求: ${results.successfulRequests}`);
  console.log(`   失败请求: ${results.failedRequests}`);
  console.log(`   成功率: ${stats.successRate}%`);
  console.log(`   请求速率: ${stats.requestsPerSecond} req/s`);

  console.log('\n⏱️  总耗时:', results.totalTime, 'ms');

  if (results.errors.length > 0) {
    console.log('\n❌ 错误详情:');
    results.errors.slice(0, 10).forEach((err, i) => {
      console.log(`   ${i + 1}. ${err.path} - ${err.error || err.status}`);
    });
    if (results.errors.length > 10) {
      console.log(`   ... 还有 ${results.errors.length - 10} 个错误`);
    }
  }

  console.log('\n========================================');
  console.log('            测试完成');
  console.log('========================================');

  if (results.failedRequests > results.totalRequests * 0.1) {
    console.log('\n⚠️ 警告: 失败率超过 10%，建议检查系统稳定性');
    process.exit(1);
  }

  if (parseFloat(stats.avg) > 5000) {
    console.log('\n⚠️ 警告: 平均响应时间超过 5 秒，建议优化性能');
    process.exit(1);
  }

  console.log('\n✅ 性能测试通过');
  process.exit(0);
}

runLoadTest().catch((err) => {
  console.error('测试执行失败:', err);
  process.exit(1);
});