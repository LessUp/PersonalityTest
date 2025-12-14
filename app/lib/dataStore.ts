import { promises as fs } from 'fs';
import path from 'path';

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
    if (raw.trim().length === 0) {
      await writeJsonFile(fileName, fallback);
      return fallback;
    }
    return JSON.parse(raw) as T;
  } catch (error: unknown) {
    const nodeError = error as NodeJS.ErrnoException;

    if (nodeError.code === 'ENOENT') {
      await writeJsonFile(fileName, fallback);
      return fallback;
    }

    if (error instanceof SyntaxError) {
      await writeJsonFile(fileName, fallback);
      return fallback;
    }

    throw error;
  }
}

async function writeJsonFile<T>(fileName: string, data: T): Promise<void> {
  const dataDir = await ensureDataDir();
  const filePath = path.join(dataDir, fileName);
  const tempPath = `${filePath}.tmp-${process.pid}-${Date.now()}`;
  await fs.writeFile(tempPath, JSON.stringify(data, null, 2));
  await fs.rename(tempPath, filePath);
}

export async function readAssessments<T>(fallback: T): Promise<T> {
  return readJsonFile('assessments.json', fallback);
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
