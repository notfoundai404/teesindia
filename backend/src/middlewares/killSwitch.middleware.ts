import { Request, Response, NextFunction } from 'express';
import axios from 'axios';

const KILL_SWITCH_URL = process.env.KILL_SWITCH_URL;

/**
 * checkKillSwitch — Remote kill-switch middleware
 *
 * Fetches a plain-text status flag from KILL_SWITCH_URL with a 2-second timeout.
 *
 * Allow/block logic:
 *   "ACTIVE"          → request proceeds normally
 *   "KILL"            → 503 Service Unavailable
 *   anything else     → 503 Service Unavailable (unexpected / empty value)
 *   fetch error/timeout → fail-open: logs a warning and calls next() so the
 *                         app never breaks due to an external network outage.
 *
 * If KILL_SWITCH_URL is not set, the middleware is a no-op (always passes through).
 */
export async function checkKillSwitch(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  if (!KILL_SWITCH_URL) {
    // No URL configured — disabled, fail open silently
    next();
    return;
  }

  try {
    const response = await axios.get<string>(KILL_SWITCH_URL, {
      timeout: 2000,                            // 2-second hard timeout
      responseType: 'text',                     // Expect plain text, not JSON
      headers: { 'Cache-Control': 'no-cache' }, // Always get a fresh value
    });

    const status = String(response.data).trim();

    if (status === 'ACTIVE') {
      // Explicitly active — allow request through
      next();
      return;
    }

    // "KILL", empty string, or any other unexpected value → suspend
    console.warn(`[KillSwitch] Status is "${status}" (not "ACTIVE") — blocking request with 503.`);
    res.status(503).json({
      error: 'Service Temporarily Unavailable',
      message: 'This application has been suspended. Please contact NotfoundAi team',
    });
  } catch (err: any) {
    // Fail-safe: if the URL is unreachable, times out, or throws (e.g. GitHub/Gist
    // is down, env var is wrong), log a warning and let the request through so the
    // app never goes down because of an external network drop.
    console.warn('[KillSwitch] Failed to fetch kill-switch status — failing open, allowing request to proceed.', err?.message ?? err);
    next();
  }
}
