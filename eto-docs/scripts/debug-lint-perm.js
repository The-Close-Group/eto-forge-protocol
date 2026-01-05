// #region agent log - debug lint permissions
const payloadBase = {
  sessionId: 'debug-session',
  runId: 'lint-perm-check',
  hypothesisId: 'H1-permissions',
};

async function log(entry) {
  const body = JSON.stringify({
    ...payloadBase,
    ...entry,
    timestamp: Date.now(),
  });
  // send to local ingest server (NDJSON should be written to /Users/jj/Documents/real/.cursor/debug.log)
  const endpoint = 'http://127.0.0.1:7242/ingest/c4e66fe6-ec0c-4065-9e2a-3f17ee0950d2';
  let delivered = false;
  try {
    await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
    });
    delivered = true;
  } catch {
    // network blocked; fall back to file append
  }
  if (!delivered) {
    try {
      const fs = await import('node:fs');
      fs.appendFileSync('/Users/jj/Documents/real/.cursor/debug.log', `${body}\n`);
    } catch {
      // swallow to avoid masking main check
    }
  }
}

async function main() {
  await log({ location: 'scripts/debug-lint-perm.js:main', message: 'start read path-key', data: {} });
  try {
    const fs = await import('node:fs');
    const content = fs.readFileSync('./node_modules/path-key/index.js', 'utf8');
    await log({
      location: 'scripts/debug-lint-perm.js:main',
      message: 'read path-key success',
      data: { length: content.length },
    });
  } catch (error) {
    await log({
      location: 'scripts/debug-lint-perm.js:main',
      message: 'read path-key failed',
      data: { name: error?.name, message: error?.message },
    });
  }
}

main();
// #endregion

