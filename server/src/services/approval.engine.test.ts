import test from 'node:test';
import assert from 'node:assert/strict';
import { ApprovalAction, ApprovalType } from '@prisma/client';
import { evaluateApprovalOutcome } from './approval.engine.js';

test('sequential workflow approves when every step is approved', () => {
  const decision = evaluateApprovalOutcome({
    approvalType: ApprovalType.SEQUENTIAL,
    steps: [
      { action: ApprovalAction.APPROVED, isVipApprover: false, isRequired: false },
      { action: ApprovalAction.APPROVED, isVipApprover: false, isRequired: false },
    ],
  });

  assert.equal(decision, 'APPROVED');
});

test('percentage workflow approves at threshold (60% of 5 => 3)', () => {
  const decision = evaluateApprovalOutcome({
    approvalType: ApprovalType.PERCENTAGE,
    percentageRequired: 60,
    steps: [
      { action: ApprovalAction.APPROVED, isVipApprover: false, isRequired: false },
      { action: ApprovalAction.APPROVED, isVipApprover: false, isRequired: false },
      { action: ApprovalAction.APPROVED, isVipApprover: false, isRequired: false },
      { action: ApprovalAction.PENDING, isVipApprover: false, isRequired: false },
      { action: ApprovalAction.PENDING, isVipApprover: false, isRequired: false },
    ],
  });

  assert.equal(decision, 'APPROVED');
});

test('VIP approver approval immediately approves expense', () => {
  const decision = evaluateApprovalOutcome({
    approvalType: ApprovalType.SEQUENTIAL,
    steps: [
      { action: ApprovalAction.APPROVED, isVipApprover: true, isRequired: false },
      { action: ApprovalAction.PENDING, isVipApprover: false, isRequired: false },
    ],
  });

  assert.equal(decision, 'APPROVED');
});

test('required approver rejection vetoes even when VIP approved', () => {
  const decision = evaluateApprovalOutcome({
    approvalType: ApprovalType.PERCENTAGE,
    percentageRequired: 60,
    steps: [
      { action: ApprovalAction.APPROVED, isVipApprover: true, isRequired: false },
      { action: ApprovalAction.REJECTED, isVipApprover: false, isRequired: true },
      { action: ApprovalAction.PENDING, isVipApprover: false, isRequired: false },
    ],
  });

  assert.equal(decision, 'REJECTED');
});
