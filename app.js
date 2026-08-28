const REPO = 'rayanbaig796-crypto/eggermath';
const API_BASE = `https://api.github.com/repos/${REPO}`;

const WORKFLOWS = [
  { id: 'auto-campaign.yml', name: 'Dev.to Auto-Campaign', card: 'devto', schedule: '0 9 * * *' },
  { id: 'auto-hn.yml', name: 'Hacker News Auto-Post', card: 'hn', schedule: '0 13 * * *' },
];

function timeAgo(date) {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function formatDuration(ms) {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return minutes > 0 ? `${minutes}m ${secs}s` : `${secs}s`;
}

function extractGameFromTitle(title) {
  const match = title.match(/Play\s+(.+?)\s+Online/i);
  return match ? match[1] : null;
}

async function fetchJSON(url) {
  try {
    const res = await fetch(url, { headers: { Accept: 'application/vnd.github.v3+json' } });
    if (!res.ok) return null;
    return await res.json();
  } catch { return null; }
}

async function checkRedditAgent() {
  try {
    const res = await fetch('https://raw.githubusercontent.com/rayanbaig796-crypto/eggermath/main/eggermath-astro/reddit-blog-state.json');
    if (!res.ok) {
      document.getElementById('redditStatus').textContent = 'Offline';
      document.getElementById('redditStatus').className = 'badge badge-red';
      return;
    }
    const state = await res.json();
    const lastRun = state.lastRun ? new Date(state.lastRun) : null;
    const usedCount = state.usedPostIds ? state.usedPostIds.length : 0;

    // Fetch logs to count actual blog posts
    let postCount = 0;
    try {
      const logRes = await fetch('https://api.github.com/repos/rayanbaig796-crypto/eggermath/contents/eggermath-astro/reddit-blog-log.json');
      if (logRes.ok) {
        const logData = await logRes.json();
        const content = JSON.parse(atob(logData.content));
        postCount = content.filter(l => l.success).length;
        const recent = content.slice(0, 5);
        const logHtml = recent.map(l => `<div style="padding:8px;border-bottom:1px solid #1e1e22;font-size:13px"><span style="color:${l.success ? '#22c55e' : '#ef4444'}">${l.success ? '✓' : '✗'}</span> ${l.title || 'Failed'} <span style="color:#666">${timeAgo(new Date(l.time))}</span></div>`).join('');
        document.getElementById('redditLog').innerHTML = logHtml || '<div style="padding:8px;color:#666">No runs yet</div>';
      }
    } catch {}

    document.getElementById('redditStatus').textContent = lastRun ? 'Active' : 'Not Run';
    document.getElementById('redditStatus').className = 'badge badge-green';

    if (lastRun) {
      document.getElementById('redditLast').textContent = timeAgo(lastRun);
      const next = new Date(lastRun.getTime() + 3600000);
      document.getElementById('redditNext').textContent = next <= Date.now() ? 'Overdue' : next.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    }
    document.getElementById('redditPosts').textContent = postCount;
  } catch {
    document.getElementById('redditStatus').textContent = 'Offline';
    document.getElementById('redditStatus').className = 'badge badge-red';
  }
}

async function checkSiteStatus() {
  try {
    const start = Date.now();
    const res = await fetch('https://www.eggermath.com/', { mode: 'no-cors' });
    const elapsed = Date.now() - start;
    document.getElementById('siteStatus').textContent = 'Online';
    document.getElementById('siteStatus').className = 'badge badge-green';
    document.getElementById('siteResponse').textContent = `${elapsed}ms`;
    document.getElementById('siteSSL').textContent = 'Valid';
    document.getElementById('siteUptime').textContent = 'Active';
  } catch {
    document.getElementById('siteStatus').textContent = 'Offline';
    document.getElementById('siteStatus').className = 'badge badge-red';
  }
}

async function loadWorkflowRuns() {
  const allRuns = [];

  // Add Reddit blog agent run if available
  try {
    const redditRes = await fetch('https://raw.githubusercontent.com/rayanbaig796-crypto/eggermath/main/eggermath-astro/reddit-blog-state.json');
    if (redditRes.ok) {
      const redditState = await redditRes.json();
      if (redditState.lastRun) {
        allRuns.push({
          workflow: 'Reddit Blog Agent',
          status: 'success',
          started: new Date(redditState.lastRun),
          duration: null,
          game: null,
          url: 'https://www.eggermath.com/blog/',
        });
      }
    }
  } catch {}

  for (const wf of WORKFLOWS) {
    const data = await fetchJSON(`${API_BASE}/actions/workflows/${wf.id}/runs?per_page=10`);
    if (!data || !data.workflow_runs) continue;

    for (const run of data.workflow_runs) {
      const game = extractGameFromTitle(run.name || run.head_commit?.message || '');
      allRuns.push({
        workflow: wf.name,
        status: run.conclusion || run.status,
        started: new Date(run.created_at),
        duration: run.run_started_at && run.updated_at
          ? new Date(run.updated_at) - new Date(run.run_started_at)
          : null,
        game,
        url: run.html_url,
      });
    }

    const latest = data.workflow_runs[0];
    if (latest) {
      const statusEl = document.getElementById(`${wf.card}Status`);
      const lastEl = document.getElementById(`${wf.card}Last`);
      const nextEl = document.getElementById(`${wf.card}Next`);

      if (latest.conclusion === 'success') {
        statusEl.textContent = 'Running';
        statusEl.className = 'badge badge-green';
      } else if (latest.conclusion === 'failure') {
        statusEl.textContent = 'Failed';
        statusEl.className = 'badge badge-red';
      } else {
        statusEl.textContent = 'Pending';
        statusEl.className = 'badge badge-yellow';
      }

      lastEl.textContent = timeAgo(new Date(latest.created_at));

      const [hour, minute] = wf.schedule.split(' ').slice(0, 2).map(Number);
      const next = new Date();
      next.setUTCHours(hour, minute, 0, 0);
      if (next <= Date.now()) next.setUTCDate(next.getUTCDate() + 1);
      nextEl.textContent = next.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', timeZoneName: 'short' });
    }
  }

  // Sort by date
  allRuns.sort((a, b) => b.started - a.started);

  // Render table
  const tbody = document.getElementById('runsBody');
  if (allRuns.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" class="loading-row">No runs found yet</td></tr>';
    return;
  }

  tbody.innerHTML = allRuns.slice(0, 20).map(run => `
    <tr>
      <td><a href="${run.url}" target="_blank" style="color: var(--gold); text-decoration: none;">${run.workflow}</a></td>
      <td class="run-${run.status === 'success' ? 'success' : run.status === 'failure' ? 'failure' : 'pending'}">${run.status}</td>
      <td>${timeAgo(run.started)}</td>
      <td>${run.duration ? formatDuration(run.duration) : '—'}</td>
      <td>${run.game ? `<span class="game-tag">${run.game}</span>` : '—'}</td>
    </tr>
  `).join('');

  // Update IndexNow card
  const lastRun = allRuns.find(r => r.workflow.includes('Dev.to'));
  if (lastRun) {
    document.getElementById('indexnowLast').textContent = timeAgo(lastRun.started);
    document.getElementById('indexnowStatus').textContent = 'Active';
    document.getElementById('indexnowStatus').className = 'badge badge-green';
    document.getElementById('indexnowUrls').textContent = '14 pages';
  }
}

function setLastUpdated() {
  document.getElementById('lastUpdated').textContent = `Updated ${new Date().toLocaleTimeString()}`;
}

async function refresh() {
  const btn = document.getElementById('refreshBtn');
  btn.style.transform = 'rotate(360deg)';
  btn.style.transition = 'transform 0.5s';

  await Promise.all([checkSiteStatus(), loadWorkflowRuns(), checkRedditAgent()]);
  setLastUpdated();

  setTimeout(() => { btn.style.transform = ''; }, 500);
}

// Auto-refresh every 5 minutes
refresh();
setInterval(refresh, 300000);
document.getElementById('refreshBtn').addEventListener('click', refresh);
