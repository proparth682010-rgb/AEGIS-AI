/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/** This demo has no cloud provider adapter, so it can only simulate actions. */
export function getPlaybookExecutionDecision(dryRun: boolean, _analystApproved: boolean): {
  allowed: boolean;
  reason: 'DRY_RUN' | 'LIVE_EXECUTION_NOT_CONFIGURED';
} {
  return dryRun
    ? { allowed: true, reason: 'DRY_RUN' }
    : { allowed: false, reason: 'LIVE_EXECUTION_NOT_CONFIGURED' };
}
