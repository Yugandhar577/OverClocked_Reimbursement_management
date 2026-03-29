import { MessageSquare, StickyNote, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs.jsx'
import { Button } from '../ui/button.jsx'

function flattenComments(comments = []) {
  return comments.flatMap((comment) => [
    comment,
    ...(comment.replies ? flattenComments(comment.replies) : []),
  ])
}

export function CommentThread({ comments = [], isSaving, onSubmit }) {
  const [message, setMessage] = useState('')
  const [note, setNote] = useState('')
  const items = useMemo(() => flattenComments(comments), [comments])

  const handleSubmit = async (commentType) => {
    const content = commentType === 'LOG' ? note.trim() : message.trim()

    if (!content) {
      return
    }

    await onSubmit({
      content,
      commentType,
    })

    if (commentType === 'LOG') {
      setNote('')
    } else {
      setMessage('')
    }
  }

  return (
    <section className="surface-card p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-ink-500">Comment Thread</p>

      <Tabs className="mt-4" defaultValue="message">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="message">Send message</TabsTrigger>
          <TabsTrigger value="note">Log note</TabsTrigger>
        </TabsList>

        <TabsContent className="mt-4 space-y-3" value="message">
          <textarea
            className="min-h-28 w-full rounded-[22px] border border-line bg-white px-4 py-3 text-sm text-ink-950 shadow-soft outline-none transition focus:border-brand-500"
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Share context with approvers or collaborators."
            value={message}
          />
          <Button disabled={isSaving} onClick={() => handleSubmit('MESSAGE')} size="sm">
            <MessageSquare className="h-4 w-4" />
            Send message
          </Button>
        </TabsContent>

        <TabsContent className="mt-4 space-y-3" value="note">
          <textarea
            className="min-h-28 w-full rounded-[22px] border border-line bg-white px-4 py-3 text-sm text-ink-950 shadow-soft outline-none transition focus:border-brand-500"
            onChange={(event) => setNote(event.target.value)}
            placeholder="Leave an internal note for the audit trail."
            value={note}
          />
          <Button disabled={isSaving} onClick={() => handleSubmit('LOG_NOTE')} size="sm" variant="secondary">
            <StickyNote className="h-4 w-4" />
            Log note
          </Button>
        </TabsContent>
      </Tabs>

      <div className="mt-5 space-y-3">
        {items.length ? (
          items.map((comment) => (
            <div key={comment.id} className="rounded-[22px] bg-[#fbf7fa] px-4 py-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-ink-950">
                    {comment.author?.firstName} {comment.author?.lastName}
                  </p>
                  <p className="text-xs uppercase tracking-[0.18em] text-ink-500">
                    {comment.commentType} • {new Date(comment.createdAt).toLocaleString()}
                  </p>
                </div>
                {comment.content === '[deleted]' ? <Trash2 className="h-4 w-4 text-ink-400" /> : null}
              </div>
              <p className="mt-3 text-sm leading-6 text-ink-700">{comment.content}</p>
            </div>
          ))
        ) : (
          <p className="rounded-[22px] bg-brand-50 px-4 py-4 text-sm leading-6 text-ink-700">
            No conversation yet. The first message here becomes the expense’s mobile paper trail.
          </p>
        )}
      </div>
    </section>
  )
}
