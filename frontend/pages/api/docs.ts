import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

// List and read docs from the monorepo /docs folder
function getDocsRoot(): string {
  // frontend/pages/api -> frontend -> .. -> project root
  const repoRoot = path.resolve(process.cwd(), '..');
  return path.join(repoRoot, 'docs');
}

function isAllowed(name: string): boolean {
  return /^(GET_STARTED\.txt|QUICKSTART\.md|PROJECT_INFO\.md|IMPLEMENTATION_SUMMARY\.md|DEPLOYMENT_READY\.md)$/i.test(
    name
  );
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const docsRoot = getDocsRoot();
  try {
    if (req.method !== 'GET') {
      res.status(405).json({ error: 'Method not allowed' });
      return;
    }

    const { list, name } = req.query as { list?: string; name?: string };

    if (list) {
      const entries = fs
        .readdirSync(docsRoot, { withFileTypes: true })
        .filter((e) => e.isFile())
        .map((e) => e.name)
        .filter((n) => /\.(md|txt)$/i.test(n) && isAllowed(n))
        .map((n) => ({
          name: n,
          title: n
            .replace(/_/g, ' ')
            .replace(/\.md$/i, '')
            .replace(/\.txt$/i, '')
            .toUpperCase(),
        }));
      res.status(200).json({ files: entries });
      return;
    }

    if (name && isAllowed(name)) {
      const target = path.join(docsRoot, path.basename(name));
      if (!fs.existsSync(target)) {
        res.status(404).json({ error: 'Not found' });
        return;
      }
      const content = fs.readFileSync(target, 'utf8');
      res.status(200).json({ name, content });
      return;
    }

    res.status(400).json({ error: 'Invalid request' });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Internal error' });
  }
}


