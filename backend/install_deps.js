const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const projectRoot = path.resolve(__dirname, '../..');
const targetLibs = path.join(projectRoot, 'biovision-ai/backend/libs');
const reqFile = path.join(projectRoot, 'biovision-ai/backend/requirements.txt');
const tmpDir = path.join(projectRoot, 'biovision-ai/backend/tmp');
const homeDir = path.join(projectRoot, 'tmp_home');

// Ensure folders exist
fs.mkdirSync(tmpDir, { recursive: true });
fs.mkdirSync(homeDir, { recursive: true });
fs.mkdirSync(targetLibs, { recursive: true });

console.log('Starting Python requirements installation to local libs folder...');
console.log(`Target: ${targetLibs}`);

try {
  execSync(
    `python3 -m pip install --no-cache-dir --target="${targetLibs}" -r "${reqFile}"`,
    {
      stdio: 'inherit',
      env: {
        ...process.env,
        TMPDIR: tmpDir,
        HOME: homeDir
      }
    }
  );
  console.log('Python packages installed successfully!');
} catch (err) {
  console.error('Failed to install Python packages:', err.message);
  process.exit(1);
}
