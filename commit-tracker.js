import fs from 'fs';
import { execSync } from 'child_process';

const DATA_FILE = 'commit-history.json';

function getCommitInfo(sha, isFirstCommit) {
  let commitMessage, commitDate, author;

  try {
    commitMessage = execSync(`git log -1 --pretty=%B ${sha}`).toString().trim();
    commitDate = new Date(execSync(`git log -1 --format=%cd ${sha}`).toString()).toISOString();
    author = execSync(`git log -1 --pretty=format:%an ${sha}`).toString().trim();
  } catch (error) {
    console.error(`Error al obtener información del commit ${sha}:`, error);
    return null;
  }

  let repoUrl = '';
  try {
    repoUrl = execSync('git config --get remote.origin.url').toString().trim().replace(/\.git$/, '');
    if (repoUrl.startsWith('git@')) {
      repoUrl = repoUrl.replace(/^git@([^:]+):(.+)$/, 'https://$1/$2');
    }
  } catch {
    console.warn('No se encontró un repositorio remoto.');
  }

  let additions = 0, deletions = 0;
  if (!isFirstCommit) {
    try {
      const diffStats = execSync(`git diff --stat ${sha}~1 ${sha}`).toString();
      const additionsMatch = diffStats.match(/(\d+) insertion/);
      const deletionsMatch = diffStats.match(/(\d+) deletion/);
      additions = additionsMatch ? parseInt(additionsMatch[1]) : 0;
      deletions = deletionsMatch ? parseInt(deletionsMatch[1]) : 0;
    } catch {}
  } else {
    additions = execSync(`git diff --stat ${sha}`).toString().match(/(\d+) insertion/);
    additions = additions ? parseInt(additions[1]) : 0;
  }

  let testCount = 0, coverage = 0;
  if (fs.existsSync('package.json')) {
    try {
      const jestOutput = execSync('npx jest --json', { stdio: 'pipe' }).toString();
      try {
        const jestResults = JSON.parse(jestOutput);
        testCount = jestResults.numTotalTests;
      } catch {
        const testCountMatch = jestOutput.match(/numTotalTests['"]\s*:\s*(\d+)/);
        if (testCountMatch) {
          testCount = parseInt(testCountMatch[1]);
        }
      }

      const coverageOutput = execSync('npm test -- --coverage --verbose', { stdio: 'pipe' }).toString();
      const coverageMatch = coverageOutput.match(/All files\s*\|\s*\d+\s*\|\s*\d+\s*\|\s*\d+\s*\|\s*(\d+(\.\d+)?)\s*\|/);
      if (coverageMatch) {
        coverage = parseFloat(coverageMatch[1]);
      }
    } catch {}
  }

  return {
    sha,
    author,
    commit: {
      date: commitDate,
      message: commitMessage,
      url: repoUrl ? `${repoUrl}/commit/${sha}` : ''
    },
    stats: {
      total: additions + deletions,
      additions,
      deletions,
      date: commitDate.split('T')[0]
    },
    coverage,
    test_count: testCount
  };
}

function isDuplicate(newCommit, existingCommits) {
  for (const commit of existingCommits) {
    if (commit.commit.message === newCommit.commit.message && 
        commit.stats.additions === newCommit.stats.additions &&
        commit.stats.deletions === newCommit.stats.deletions &&
        commit.test_count === newCommit.test_count) {
      
      const existingDate = new Date(commit.commit.date);
      const newDate = new Date(newCommit.commit.date);
      
      if (newDate >= existingDate) {
        console.log(`Detectado commit con contenido duplicado (${newCommit.sha}), se mantiene el más antiguo (${commit.sha})`);
        return true;
      }
    }
  }
  return false;
}

function saveCommitData(commitData) {
  let commits = [];
  if (fs.existsSync(DATA_FILE)) {
    try {
      commits = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    } catch (error) {
      console.error('Error al leer el archivo de datos:', error);
      commits = [];
    }
  }

  const existingIndex = commits.findIndex(c => c.sha === commitData.sha);
  
  if (existingIndex >= 0) {
    commits[existingIndex] = commitData;
    console.log(`Actualizada la información del commit ${commitData.sha}`);
  } else if (!isDuplicate(commitData, commits)) {
    commits.push(commitData);
    console.log(`Agregado nuevo commit ${commitData.sha}`);
  }

  if (commitData.commit.url) {
    commits.forEach(commit => {
      if (!commit.commit.url) {
        commit.commit.url = commitData.commit.url.replace(/\/commit\/[^/]+$/, `/commit/${commit.sha}`);
      }
    });
  }

  commits.sort((a, b) => new Date(a.commit.date) - new Date(b.commit.date));

  fs.writeFileSync(DATA_FILE, JSON.stringify(commits, null, 2));
}

try {
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2));
  }

  const currentSha = execSync('git rev-parse HEAD').toString().trim();
  const isFirstCommit = execSync('git rev-list --count HEAD').toString().trim() === '1';

  const currentCommitData = getCommitInfo(currentSha, isFirstCommit);
  if (currentCommitData) {
    saveCommitData(currentCommitData);
  }
} catch (error) {
  console.error('Error en el script de seguimiento de commits:', error);
  process.exit(1);
}

