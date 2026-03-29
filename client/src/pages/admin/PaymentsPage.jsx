import { Download, IndianRupee, LoaderCircle, ShieldCheck, Zap } from 'lucide-react'
import { useState } from 'react'
import {
  createPaymentOrderRequest,
  getPaymentsQueue,
} from '../../api/payments.api.js'
import { AvatarBadge } from '../../components/shared/AvatarBadge.jsx'
import { DataTable } from '../../components/shared/DataTable.jsx'
import { LoadingPanel } from '../../components/shared/LoadingPanel.jsx'
import { PageHeader } from '../../components/shared/PageHeader.jsx'
import { PageTransition, Reveal } from '../../components/shared/PageTransition.jsx'
import { StatusBadge } from '../../components/shared/StatusBadge.jsx'
import { Button } from '../../components/ui/button.jsx'
import { Card } from '../../components/ui/card.jsx'
import { Tabs, TabsList, TabsTrigger } from '../../components/ui/tabs.jsx'
import { useMockResource } from '../../hooks/useMockResource.js'

export function PaymentsPage() {
  const [refreshKey, setRefreshKey] = useState(0)
  const [activeTab, setActiveTab] = useState('All')
  const [isBatchProcessing, setIsBatchProcessing] = useState(false)
  const [rowProcessingIds, setRowProcessingIds] = useState([])
  const [feedbackError, setFeedbackError] = useState('')
  const [feedbackMessage, setFeedbackMessage] = useState('')
  const { data, isLoading } = useMockResource(getPaymentsQueue, [refreshKey])

  if (isLoading || !data) {
    return <LoadingPanel />
  }

  const filteredRows = activeTab === 'Unpaid'
    ? data.rows.filter((row) => row.status === 'Pending Payment')
    : activeTab === 'Processing'
      ? data.rows.filter((row) => row.status === 'Processing')
      : data.rows

  const startRowProcessing = (expenseId) => {
    setRowProcessingIds((current) => (current.includes(expenseId) ? current : [...current, expenseId]))
  }

  const stopRowProcessing = (expenseId) => {
    setRowProcessingIds((current) => current.filter((id) => id !== expenseId))
  }

  const handleTriggerSingle = async (expenseId) => {
    setFeedbackError('')
    setFeedbackMessage('')
    startRowProcessing(expenseId)

    try {
      const order = await createPaymentOrderRequest(expenseId)
      setFeedbackMessage(`Payment initiated. Order ${order.orderId} is now in progress.`)
      setRefreshKey((value) => value + 1)
    } catch (error) {
      setFeedbackError(
        error?.response?.data?.message ??
          error?.message ??
          'Unable to trigger payment for this expense.',
      )
    } finally {
      stopRowProcessing(expenseId)
    }
  }

  const handleTriggerBatch = async () => {
    const readyExpenseIds = data.rows
      .filter((row) => row.action === 'Trigger')
      .map((row) => row.id)

    if (!readyExpenseIds.length) {
      setFeedbackError('No approved expenses are currently ready for payment trigger.')
      setFeedbackMessage('')
      return
    }

    setIsBatchProcessing(true)
    setFeedbackError('')
    setFeedbackMessage('')

    let successCount = 0
    let failedCount = 0

    for (const expenseId of readyExpenseIds) {
      try {
        await createPaymentOrderRequest(expenseId)
        successCount += 1
      } catch {
        failedCount += 1
      }
    }

    if (failedCount) {
      setFeedbackError(`${failedCount} payment triggers failed. Check Razorpay configuration and retry.`)
    }

    if (successCount) {
      setFeedbackMessage(`${successCount} payment order(s) were initiated successfully.`)
    }

    setIsBatchProcessing(false)
    setRefreshKey((value) => value + 1)
  }

  const columns = [
    {
      key: 'employee',
      header: 'Employee',
      render: (row) => (
        <div className="flex items-center gap-3">
          <AvatarBadge initials={row.initials} toneClass="bg-brand-100 text-brand-900" />
          <div>
            <p className="font-semibold text-ink-950">{row.employee}</p>
            <p className="text-sm text-ink-500">{row.department}</p>
          </div>
        </div>
      ),
    },
    { key: 'category', header: 'Category' },
    { key: 'submitted', header: 'Submitted Date' },
    {
      key: 'amount',
      header: 'Amount',
      render: (row) => <span className="font-bold text-ink-950">{row.amount}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: 'action',
      header: 'Action',
      render: (row) => (
        <Button
          disabled={row.action !== 'Trigger' || rowProcessingIds.includes(row.id) || isBatchProcessing}
          onClick={() => handleTriggerSingle(row.id)}
          size="sm"
          variant={row.action === 'Trigger' ? 'secondary' : 'ghost'}
        >
          {rowProcessingIds.includes(row.id) ? (
            <LoaderCircle className="h-4 w-4 animate-spin" />
          ) : null}
          {row.action === 'Trigger' ? 'Trigger' : 'Locked'}
        </Button>
      ),
    },
  ]

  return (
    <PageTransition className="space-y-8">
      <Reveal>
        <PageHeader
          actions={
            <>
              <Button size="sm" variant="secondary">
                <Download className="h-4 w-4" />
                Download Report
              </Button>
              <Button disabled={isBatchProcessing} onClick={handleTriggerBatch} size="sm">
                {isBatchProcessing ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
                <Zap className="h-4 w-4" />
                Trigger Batch Payment
              </Button>
            </>
          }
          description="Manage and execute outbound transfers for verified business expenses with approval-aware sequencing."
          eyebrow="Treasury Operations"
          title="Payments Queue"
        />
      </Reveal>

      <div className="grid gap-5 xl:grid-cols-3">
        {data.stats.map((item, index) => (
          <Reveal key={item.label}>
            <Card
              className={`p-6 ${
                index === 2 ? 'bg-gradient-to-br from-brand-800 to-brand-700 text-white' : ''
              }`}
            >
              <p
                className={`text-[11px] font-semibold uppercase tracking-[0.24em] ${
                  index === 2 ? 'text-white/70' : 'text-ink-500'
                }`}
              >
                {item.label}
              </p>
              <p
                className={`mt-4 font-display text-[2.8rem] font-black tracking-[-0.05em] ${
                  index === 2 ? 'text-white' : 'text-ink-950'
                }`}
              >
                {item.value}
              </p>
              <p className={`mt-2 text-sm ${index === 2 ? 'text-white/80' : 'text-ink-600'}`}>
                {item.note}
              </p>
            </Card>
          </Reveal>
        ))}
      </div>

      <Reveal>
        <Card className="p-6">
          {feedbackError ? (
            <div className="mb-4 rounded-[20px] bg-red-50 px-4 py-3 text-sm text-red-700">
              {feedbackError}
            </div>
          ) : null}

          {feedbackMessage ? (
            <div className="mb-4 rounded-[20px] bg-aqua-50 px-4 py-3 text-sm text-aqua-700">
              {feedbackMessage}
            </div>
          ) : null}

          <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <h2 className="font-display text-2xl font-bold tracking-[-0.03em] text-ink-950">
                Transaction Ledger
              </h2>
              <p className="mt-1 text-sm text-ink-500">
                Prioritize queue items by payout readiness and integration state.
              </p>
            </div>
            <Tabs onValueChange={setActiveTab} value={activeTab}>
              <TabsList>
                {data.tabs.map((tab) => (
                  <TabsTrigger key={tab} value={tab}>
                    {tab}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>

          <div className="mt-6">
            <DataTable rows={filteredRows} columns={columns} />
          </div>
        </Card>
      </Reveal>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <Reveal>
          <Card className="flex h-full items-center gap-4 p-6">
            <div className="rounded-2xl bg-brand-50 p-3 text-brand-800">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold text-ink-950">Enterprise Grade Security</p>
              <p className="mt-1 text-sm leading-6 text-ink-600">
                All payments are processed through approval-scoped channels with
                strong encryption and audit logs.
              </p>
            </div>
          </Card>
        </Reveal>

        <Reveal>
          <Card className="flex h-full items-center justify-between gap-5 p-6">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-ink-500">
                Last Batch Run
              </p>
              <p className="mt-3 font-semibold text-ink-950">Today, 09:12 AM</p>
            </div>
            <div className="text-right">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-ink-500">
                Total Paid (MTD)
              </p>
              <p className="mt-3 flex items-center justify-end gap-1 font-display text-[2rem] font-black tracking-[-0.05em] text-aqua-700">
                <IndianRupee className="h-5 w-5" />
                24,82,000
              </p>
            </div>
          </Card>
        </Reveal>
      </div>
    </PageTransition>
  )
}
