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

async function getAzureStatus() {
  const versionRes = await execCmd('az --version');
  if (!versionRes.success) {
    return {
      status: 'not_installed',
      installed: false,
      version: null,
      user: null,
      subscription: null,
      tenantId: null,
    };
  }

  const version = versionRes.stdout.split('\n')[0].trim();

  // Test authentication without exposing sensitive credentials
  const accountRes = await execCmd('az account show --output json');
  if (!accountRes.success) {
    return {
      status: 'not_authenticated',
      installed: true,
      version: version,
      user: null,
      subscription: null,
      tenantId: null,
      message: 'Azure CLI installed but not logged in. Run "az login" to authenticate.',
    };
  }

  try {
    const data = JSON.parse(accountRes.stdout);
    return {
      status: 'authenticated',
      installed: true,
      version: version,
      user: data.user ? data.user.name : null,
      subscription: data.name || null,
      tenantId: data.tenantId || null,
    };
  } catch {
    return {
      status: 'authenticated',
      installed: true,
      version: version,
      user: null,
      subscription: null,
      tenantId: null,
    };
  }
}

module.exports = {
  getAzureStatus,
};
