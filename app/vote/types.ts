export type Choice = 'YES' | 'NO' | 'ABSTAIN'

export type Proposal = {
  id: string
  title: string
  description: string
}

export type Selections = Record<string, Choice | null>

