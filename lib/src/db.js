import nano from 'nano'

export const table = 'batons'
export const repo  = nano('http://localhost:5984')

repo.db.create(table)

export const session = () => repo.db.use(table)
