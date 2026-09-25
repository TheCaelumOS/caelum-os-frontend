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

async function getGitStatus() {
  const versionRes = await execCmd('git --version');
  if (!versionRes.success) {
    return {
      status: 'not_installed',
      installed: false,
      version: null,
      userName: null,
      userEmail: null,
    };
  }

  const version = versionRes.stdout.replace(/^git version\s*/i, '').trim();

  const [nameRes, emailRes] = await Promise.all([
    execCmd('git config --global user.name'),
    execCmd('git config --global user.email'),
  ]);

  return {
    status: 'ready',
    installed: true,
    version: version || 'installed',
    userName: nameRes.success && nameRes.stdout ? nameRes.stdout : null,
    userEmail: emailRes.success && emailRes.stdout ? emailRes.stdout : null,
  };
}

module.exports = {
  getGitStatus,
};
