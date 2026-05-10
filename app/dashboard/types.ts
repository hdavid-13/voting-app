// app/dashboard/types.ts
export type Proposal = {
  id: string
  title: string
  description: string
  status: 'OPEN' | 'CLOSED'
  method: 'PUBLIC' | 'SECRET'
  created_at: string
  closed_at: string | null
  yes_count: number
  no_count: number
  abstain_count: number
}
