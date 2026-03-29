# Gotchas & Edge Cases

## Approval Engine
- **Circular reporting**: Prevent `reports_to` chains from forming cycles. Validate on CSV import and user update.
- **Self-approval**: A manager cannot approve their own expenses. Their expense should route to their `reports_to`.
- **Approval limit escalation**: If `expense.converted_amount > manager.approval_limit`, auto-escalate to the next level without rejecting.
- **Percentage math**: When `min_approval_percentage = 60` and there are 5 approvers, use `ceil(5 * 0.6) = 3`.
- **VIP + Required conflict**: A required approver rejection still overrides the rest of the chain.

## Expense / Duplicate Detection
- **Split expense conflicts**: When an employee splits expense A into A1 and A2, both belong to the same person. Do not flag A1 and A2 as duplicates of each other.
- **Currency rounding**: Always use `DECIMAL(12,2)` instead of `FLOAT`. Format carefully on the frontend and round deliberately on the backend.
- **Exchange rate timing**: Capture and store the rate at submission time. Do not re-convert later.
- **Duplicate detection window**: Same employee + same date +/- 1 day + amount within 10% should be a warning, not a blocker.

## CSV Import
- **Email uniqueness**: If an email already exists, skip that row instead of failing the whole batch.
- **Missing manager**: If `reports_to_email` references someone missing from both the CSV and DB, skip the relationship and flag a warning.
- **Department dedup**: Normalize department names like `Engineering`, `engineering`, and `ENGINEERING` to a shared title-case value.
- **Position mapping**: Position is free text from CSV, not an enum.

## Auth
- **Token refresh race**: If two tabs refresh at the same time, only one should succeed. Use token rotation.
- **Password reset**: Store only the SHA-256 hash of the reset token in the DB, keep the raw token only in the email link, and expire it after 1 hour.

## Prisma
- **Migration metadata**: `server/prisma/migrations/migration_lock.toml` must contain `provider = "postgresql"`. If it is empty, `prisma migrate dev` fails with `P3019` even when the SQL files are valid.

## OCR
- **Mindee quota**: Track Mindee usage and fall back to OCR.space when quota is exhausted.
- **OCR accuracy**: Always let the user review and edit OCR-parsed data before submission.
- **Image quality**: Reject obviously blank or unusable images early.

## Razorpay
- **Test mode**: Always use Razorpay test keys during development.
- **Signature verification**: Verify the payment signature server-side before marking an expense as paid.

## Frontend
- **Tailwind purge**: Ensure `content` paths in `tailwind.config.js` include all JSX files.
- **Mobile viewport**: Set the viewport meta tag correctly or the mobile layout will break.
- **JWT in memory**: Keep the access token in memory and the refresh token in an httpOnly cookie.
