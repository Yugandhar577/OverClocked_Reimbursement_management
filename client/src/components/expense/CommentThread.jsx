import { MessageSquare, StickyNote } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Button } from '../ui/button.jsx'

function flattenComments(comments = []) {
  return comments.flatMap((comment) => [
    comment,
    ...(comment.replies ? flattenComments(comment.replies) : []),
  ])
}

export function CommentThread({ comments = [], isSaving, onSubmit }) {
  const [activeTab, setActiveTab] = useState('message')
  const [message, setMessage] = useState('')
  const [note, setNote] = useState('')
  const items = useMemo(() => flattenComments(comments), [comments])

  const handleSubmit = async (commentType) => {
    const content = commentType === 'LOG_NOTE' ? note.trim() : message.trim()

    if (!content) {
      return
    }

    await onSubmit({
      content,
      commentType,
    })

    if (commentType === 'LOG_NOTE') {
      setNote('')
    } else {
      setMessage('')
    }
  }

  return (
    <section className="odoo-panel overflow-hidden">
      <div className="border-b border-line px-4 pt-4">
        <div className="flex items-end gap-2">
          <button
            className={activeTab === 'message' ? 'odoo-chatter-tab odoo-chatter-tab-active' : 'odoo-chatter-tab'}
            onClick={() => setActiveTab('message')}
            type="button"
          >
            Send message
          </button>
          <button
            className={activeTab === 'note' ? 'odoo-chatter-tab odoo-chatter-tab-active' : 'odoo-chatter-tab'}
            onClick={() => setActiveTab('note')}
            type="button"
          >
            Log note
          </button>
          <button className="odoo-chatter-tab" type="button">
            Activities
          </button>
        </div>
      </div>

      <div className="border-b border-line px-4 py-4">
        {activeTab === 'message' ? (
          <div className="space-y-3">
            <textarea
              className="min-h-28 w-full rounded-md border border-line bg-white px-4 py-3 text-sm text-ink-950 outline-none transition focus:border-brand-700 focus:ring-2 focus:ring-brand-100"
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Discuss the expense with approvers or collaborators..."
              value={message}
            />
            <Button
              className="!h-10 !rounded-md !px-4"
              disabled={isSaving}
              onClick={() => handleSubmit('MESSAGE')}
            >
              <MessageSquare className="h-4 w-4" />
              Send message
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <textarea
              className="min-h-28 w-full rounded-md border border-line bg-white px-4 py-3 text-sm text-ink-950 outline-none transition focus:border-brand-700 focus:ring-2 focus:ring-brand-100"
              onChange={(event) => setNote(event.target.value)}
              placeholder="Record an internal note for the audit trail..."
              value={note}
            />
            <Button
              className="!h-10 !rounded-md !px-4"
              disabled={isSaving}
              onClick={() => handleSubmit('LOG_NOTE')}
              variant="secondary"
            >
              <StickyNote className="h-4 w-4" />
              Log note
            </Button>
          </div>
        )}
      </div>

      <div className="px-4 py-5">
        {items.length ? (
          <div className="space-y-5">
            {items.map((comment) => (
              <div key={comment.id} className="flex gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-50 text-sm font-semibold text-brand-900">
                  {(comment.author?.firstName?.[0] ?? 'U').toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    <span className="font-semibold text-ink-950">
                      {comment.author?.firstName} {comment.author?.lastName}
                    </span>
                    <span className="text-ink-500">
                      {new Date(comment.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-7 text-ink-700">{comment.content}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm leading-7 text-ink-600">
            No chatter yet. Use messages for collaborative discussion and notes for internal audit context.
          </p>
        )}
      </div>
    </section>
  )
}
