const Queue = require('bull');
const { generateFinancialInsights } = require('./aiService');
const { setCache } = require('../config/redisClient');

/**
 * Queue Service — Bull Job Queue
 * 
 * Offloads heavy AI processing to background workers so API responses
 * stay fast under concurrent load. Uses Redis as the job store.
 * 
 * Queues:
 * - aiInsightsQueue: Background generation of AI financial insights
 */

let aiInsightsQueue = null;
let isQueueReady = false;

const initQueues = () => {
  const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

  if (process.env.ENABLE_CACHE === 'false') {
    console.log('⏭️  Job queues disabled (Redis not enabled)');
    return;
  }

  try {
    aiInsightsQueue = new Queue('ai-insights', redisUrl, {
      defaultJobOptions: {
        removeOnComplete: 50,  // Keep last 50 completed jobs
        removeOnFail: 20,      // Keep last 20 failed jobs
        attempts: 2,
        backoff: { type: 'exponential', delay: 2000 },
        timeout: 30000,        // 30s timeout for AI calls
      },
    });

    // Process insights jobs
    aiInsightsQueue.process(async (job) => {
      const { userId, userData } = job.data;
      const result = await generateFinancialInsights(userData);

      // Cache the result for 10 minutes
      const cacheKey = `ai:insights:${userId}`;
      await setCache(cacheKey, result, 600);

      return result;
    });

    aiInsightsQueue.on('ready', () => {
      isQueueReady = true;
      console.log('✅ Bull job queue ready');
    });

    aiInsightsQueue.on('error', (err) => {
      console.warn(`⚠️  Queue error: ${err.message}`);
      isQueueReady = false;
    });

    aiInsightsQueue.on('failed', (job, err) => {
      console.warn(`⚠️  Job ${job.id} failed: ${err.message}`);
    });
  } catch (error) {
    console.warn(`⚠️  Queue init failed: ${error.message}. AI processing will be synchronous.`);
  }
};

/**
 * Enqueue an AI insights generation job
 * @param {string} userId - User ID
 * @param {Object} userData - Financial data for insights
 * @returns {Object|null} Job object or null if queue unavailable
 */
const enqueueInsightsJob = async (userId, userData) => {
  if (!aiInsightsQueue || !isQueueReady) return null;
  try {
    const job = await aiInsightsQueue.add({ userId, userData });
    return { jobId: job.id, status: 'queued' };
  } catch (error) {
    return null;
  }
};

/**
 * Get job status
 * @param {string} jobId - Bull job ID
 * @returns {Object} Job status info
 */
const getJobStatus = async (jobId) => {
  if (!aiInsightsQueue) return { status: 'unavailable' };
  try {
    const job = await aiInsightsQueue.getJob(jobId);
    if (!job) return { status: 'not_found' };

    const state = await job.getState();
    return {
      status: state,
      progress: job.progress(),
      result: state === 'completed' ? job.returnvalue : null,
      failedReason: state === 'failed' ? job.failedReason : null,
    };
  } catch (error) {
    return { status: 'error', message: error.message };
  }
};

const getQueueStats = async () => {
  if (!aiInsightsQueue) return { available: false };
  try {
    const counts = await aiInsightsQueue.getJobCounts();
    return { available: isQueueReady, ...counts };
  } catch (error) {
    return { available: false };
  }
};

module.exports = {
  initQueues,
  enqueueInsightsJob,
  getJobStatus,
  getQueueStats,
};
