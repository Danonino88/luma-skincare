import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

console.log(readFileSync(resolve('database/schema.sql'), 'utf8'))
