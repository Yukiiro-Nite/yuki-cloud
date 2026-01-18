import path from 'node:path'
import fs from 'node:fs'
import express from 'express'

import { handleGet } from './handlers/handleGet.js'
import { handlePost } from './handlers/handlePost.js'
import { handleDelete } from './handlers/handleDelete.js'

const port = process.env.PORT || 3000
const storageRoot = process.env.STORAGE_ROOT || path.join(process.cwd(), 'storage')
const app = express()
app.use(express.urlencoded({ extended: true }))

if (!fs.existsSync(storageRoot)) {
  console.error(`Storage directory does not exist at ${storageRoot}`)
  console.log(`Creating storage directory at ${storageRoot}`)
  fs.mkdirSync(storageRoot, {recursive: true})
}

// Handle get requests. Return a browse page for directories, return download for files.
app.get("/{*splat}", handleGet(storageRoot))

// Handle post requests. Create new folder or upload file to current folder. Also handles deleting folders and files
app.post("/{*splat}", handlePost(storageRoot))


app.listen(port, (error) => {
  if (error) {
    console.error("Problem starting server: ", error)
  }

  console.log(`[❄️ ☁️ ] started on port: ${port}`)
})