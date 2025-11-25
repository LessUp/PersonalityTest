import { promises as fs } from 'fs';
import path from 'path';
import type { Assessment } from './types';

async function ensureDataDir() {
  const dataDir = path.join(process.cwd(), 'data');
  await fs.mkdir(dataDir, { recursive: true });
  return dataDir;
}

async function readJsonFile<T>(fileName: string, fallback: T): Promise<T> {
  const dataDir = await ensureDataDir();
  const filePath = path.join(dataDir, fileName);

  try {
    const raw = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(raw) as T;
  } catch (error: unknown) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      await fs.writeFile(filePath, JSON.stringify(fallback, null, 2));
      return fallback;
    }

    throw error;
  }
}

async function writeJsonFile<T>(fileName: string, data: T): Promise<void> {
  const dataDir = await ensureDataDir();
  const filePath = path.join(dataDir, fileName);
  await fs.writeFile(filePath, JSON.stringify(data, null, 2));
}

// 读取并合并所有量表数据
export async function readAssessments<T extends Assessment[]>(fallback: T): Promise<T> {
  const dataDir = await ensureDataDir();
  const allAssessments: Assessment[] = [];
  
  const assessmentFiles = [
    'assessments-extended.json',
    'additional-assessments.json',
    'assessments.json',
  ];

  for (const fileName of assessmentFiles) {
    const filePath = path.join(dataDir, fileName);
    try {
      const raw = await fs.readFile(filePath, 'utf-8');
      const data = JSON.parse(raw) as Assessment[];
      // 避免重复的 assessment id
      data.forEach(assessment => {
        if (!allAssessments.find(a => a.id === assessment.id)) {
          allAssessments.push(assessment);
        }
      });
    } catch {
      // 文件不存在时跳过
    }
  }

  if (allAssessments.length === 0) {
    return fallback;
  }

  return allAssessments as T;
}

export async function writeAssessments<T>(data: T): Promise<void> {
  return writeJsonFile('assessments.json', data);
}

export async function readSubmissions<T>(fallback: T): Promise<T> {
  return readJsonFile('submissions.json', fallback);
}

export async function writeSubmissions<T>(data: T): Promise<void> {
  return writeJsonFile('submissions.json', data);
}
