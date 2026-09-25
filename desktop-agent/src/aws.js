const { exec } = require('child_process');

function execCmd(cmd, timeoutMs = 5000) {
  return new Promise((resolve) => {
    exec(cmd, { timeout: timeoutMs, windowsHide: true }, (err, stdout, stderr) => {
      if (err) {
        return resolve({ success: false, stdout: '', stderr: (stderr || err.message).trim() });
      }
      return resolve({ success: true, stdout: stdout.trim(), stderr: '' });
    });
  });
}

async function getAwsStatus() {
  const versionRes = await execCmd('aws --version');
  if (!versionRes.success) {
    return {
      status: 'not_installed',
      installed: false,
      version: null,
      account: null,
      arn: null,
      userId: null,
    };
  }

  const version = versionRes.stdout.split('\n')[0].trim();

  // Test authentication without exposing any secret keys
  const idRes = await execCmd('aws sts get-caller-identity --output json');
  if (!idRes.success) {
    return {
      status: 'not_authenticated',
      installed: true,
      version: version,
      account: null,
      arn: null,
      userId: null,
      message: 'AWS CLI installed but no valid active session/credentials found',
    };
  }

  try {
    const data = JSON.parse(idRes.stdout);
    return {
      status: 'authenticated',
      installed: true,
      version: version,
      account: data.Account || null,
      arn: data.Arn || null,
      userId: data.UserId || null,
    };
  } catch {
    return {
      status: 'authenticated',
      installed: true,
      version: version,
      account: null,
      arn: null,
      userId: null,
    };
  }
}

module.exports = {
  getAwsStatus,
};
