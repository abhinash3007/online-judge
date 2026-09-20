const path = require('path');
const { spawn } = require('child_process');

// taskkill by absolute path, so killing still works when System32 is missing from the service's PATH
const TASKKILL = path.join(process.env.SystemRoot || 'C:\\Windows', 'System32', 'taskkill.exe');

// Kill a child process together with everything it started. Killing only the child would let a
// program that spawns helpers (or a compiler started through a shell) keep running in the background.
//   Windows: `taskkill /T` walks the process tree.
//   Elsewhere: the child was started with `detached: true`, so it leads its own process group and
//   a negative pid signals the whole group.
const killTree = (child) => {
    if (!child || !child.pid) return;

    try {
        if (process.platform === 'win32') {
            spawn(TASKKILL, ['/pid', String(child.pid), '/T', '/F'], { stdio: 'ignore', windowsHide: true })
                .on('error', () => child.kill('SIGKILL'));
        } else {
            process.kill(-child.pid, 'SIGKILL');
        }
    } catch {
        child.kill('SIGKILL');
    }
};

module.exports = { killTree };
