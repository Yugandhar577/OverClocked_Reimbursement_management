# Gotchas & Edge Cases

## Approval Engine
- **Circular reporting**: Prevent `reports_to` chains from forming cycles. Validate on CSV import and user update.
- **Self-approval**: A manager CANNOT approve their own expenses. Their expense goes to THEIR `reports_to`.
- **Approval limit escalation**: If `expense.converted_amount > manager.approval_limit`, auto-escalate to next level WITHOUT rejecting.
- **Percentage math**: When `min_approval_percentage = 60` and there are 5 approvers, you need ceil(5 * 0.6) = 3 approvals. Don't use floor.
- **VIP + Required conflict**: If a VIP approves but a required approver hasn't acted yet, the VIP takes priority. If a required approver REJECTS, it overrides even VIP approval.

## Expense / Duplicate Detection
- **Split expense conflicts**: When an employee splits expense A into A1 and A2, both belong to the same person. Don't flag A1 and A2 as duplicates of each other.
- **Currency rounding**: Always use DECIMAL(12,2) not FLOAT. Use `toFixed(2)` on frontend, `ROUND()` in SQL.
- **Exchange rate timing**: Capture and store the rate at submission time. Don't re-convert later.
- **Duplicate detection window**: Same employee + same date ±1 day + amount within 10% = warning (NOT blocking).

## CSV Import
- **Email uniqueness**: If an email already exists, skip that row (don't error the whole batch).
- **Missing manager**: If `reports_to_email` references someone not in the CSV AND not in the DB, skip relationship and flag warning.
- **Department dedup**: CSV may have "Engineering", "engineering", "ENGINEERING" — normalize to title case.
- **Position mapping**: Position is free-text from CSV, not enum. Don't validate it, just store it.

## Auth
- **Token refresh race**: If two tabs refresh at the same time, only one should succeed. Use token rotation.
- **Password reset**: Generate a random temp password, hash with bcrypt. Force password change on first login after reset.

## OCR
- **Mindee quota**: 250 pages/month free. Track usage. Fall back to OCR.space when quota exceeded.
- **OCR accuracy**: Always let the user review and edit OCR-parsed data before submission. Never auto-submit.
- **Image quality**: Reject blurry/dark images with warning. Check file size > 10KB (too small = blank).

## Razorpay
- **Test mode**: Always use Razorpay Test Keys during development. Never commit real keys.
- **Signature verification**: ALWAYS verify payment signature server-side before marking as paid. Never trust client-side callback alone.

## Frontend
- **Tailwind purge**: Ensure `content` paths in `tailwind.config.js` include all JSX files, or classes will be purged in production.
- **Mobile viewport**: Set `<meta name="viewport" content="width=device-width, initial-scale=1">` or mobile layout breaks.
- **JWT in memory**: Store access token in memory (Zustand), NOT localStorage. Refresh token in httpOnly cookie only.
