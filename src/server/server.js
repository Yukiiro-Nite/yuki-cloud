import path from 'node:path'
import fs from 'node:fs'
import express from 'express'
import busboy from 'busboy'

import { renderDirPage } from './dirPage.js'

const port = process.env.PORT || 3000
const storageRoot = process.env.STORAGE_ROOT || path.join(process.cwd(), 'storage')
const app = express()

if (!fs.existsSync(storageRoot)) {
  console.error(`Storage directory does not exist at ${storageRoot}`)
  console.log(`Creating storage directory at ${storageRoot}`)
  fs.mkdirSync(storageRoot, {recursive: true})
}

app.get("/{*splat}", (req, res) => {
  const reqPath = req.path
  const storagePath = path.join(storageRoot, reqPath)
  const relativePath = path.relative(storageRoot, storagePath)
  const exists = fs.existsSync(storagePath)
  if (!exists) {
    res.status(404).send("File not found!")
    return
  }

  const stats = fs.statSync(storagePath)
  const isDir = stats.isDirectory()

  if (isDir) {
    const dirHTML = renderDirPage(
      storageRoot,
      storagePath,
      relativePath
    )
    res.contentType('html').send(dirHTML)

    return
  }

  res.download(storagePath)
})

app.post("/{*splat}", async (req, res) => {
  const reqPath = req.path
  const storagePath = path.join(storageRoot, reqPath)
  const relativePath = path.relative(storageRoot, storagePath)
  const exists = fs.existsSync(storagePath)
  if (!exists) {
    res.status(404).send("File not found!")
    return
  }

  const stats = fs.statSync(storagePath)
  const isDir = stats.isDirectory()

  if (!isDir) {
    res.status(400).send("Can not upload to file path.")
  }

  // Do uploading stuff here
  const bb = busboy({ headers: req.headers })

  await new Promise((resolve) => {
    bb.on('file', (name, file, info) => {
      const {filename} = info
      const savePath = path.join(storagePath, filename)
      console.log(`Uploading to ${savePath}`)
      file.pipe(fs.createWriteStream(savePath))
    })

    bb.on('close', resolve)

    req.pipe(bb)
  })

  const dirHTML = renderDirPage(
    storageRoot,
    storagePath,
    relativePath
  )

  res.contentType('html').send(dirHTML)
})

app.listen(port, (error) => {
  if (error) {
    console.error("Problem starting server: ", error)
  }

  console.log(`[❄️ ☁️ ] started on port: ${port}`)
})