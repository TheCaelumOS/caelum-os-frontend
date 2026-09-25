const { exec } = require('child_process');

function execCmd(cmd, timeoutMs = 4000) {
  return new Promise((resolve) => {
    exec(cmd, { timeout: timeoutMs, windowsHide: true }, (err, stdout, stderr) => {
      if (err) {
        return resolve({ success: false, stdout: '', stderr: (stderr || err.message).trim() });
      }
      return resolve({ success: true, stdout: stdout.trim(), stderr: '' });
    });
  });
}

async function getTerraformStatus() {
  const versionRes = await execCmd('terraform -version');
  if (!versionRes.success) {
    return {
      status: 'not_installed',
      installed: false,
      version: null,
    };
  }

  // Extract first line like "Terraform v1.14.5"
  const firstLine = versionRes.stdout.split('\n')[0].trim();

  return {
    status: 'ready',
    installed: true,
    version: firstLine || 'installed',
  };
}

module.exports = {
  getTerraformStatus,
};
