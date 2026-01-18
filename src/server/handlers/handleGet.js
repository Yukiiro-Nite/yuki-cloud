import path from 'node:path'
import fs from 'node:fs'
import { renderDirPage } from '../dirPage.js'

/**
 * 
 * @param {string} storageRoot - Path to storage root
 * @returns {(req: import('express').Request, res: import('express').Response) => void}
 */
export const handleGet = (storageRoot) => (req, res) => {
  const reqPath = decodeURI(req.path)
  const storagePath = path.join(storageRoot, reqPath)
  const relativePath = path.relative(storageRoot, storagePath)
  const exists = fs.existsSync(storagePath)
  console.log(`Checking for file or folder at ${relativePath}`)
  if (!exists) {
    res.status(404).send("File not found!")
    return
  }

  const stats = fs.statSync(storagePath)
  const isDir = stats.isDirectory()

  if (isDir) {
    console.log(`Fetching folder contents for: ${relativePath}`)
    const dirHTML = renderDirPage(
      storageRoot,
      storagePath,
      relativePath
    )
    res.contentType('html').send(dirHTML)

    return
  }

  console.log(`Downloading ${relativePath}`)
  res.download(storagePath)
}