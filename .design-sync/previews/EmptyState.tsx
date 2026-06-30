import { Button, EmptyState } from '@misoto22/design'
import { FileText, Inbox } from 'lucide-react'

export function NoPosts() {
  return (
    <EmptyState
      icon={FileText}
      title="No posts yet"
      description="Drafts and published articles will appear here once you write your first post."
      action={<Button>Write a post</Button>}
    />
  )
}

export function NoDrafts() {
  return <EmptyState icon={Inbox} title="No drafts in the queue" />
}
