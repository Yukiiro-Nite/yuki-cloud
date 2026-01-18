import path from 'node:path'
import fs from 'node:fs'

/**
 * 
 * @param {string} storageRoot - Path to storage root
 * @returns {(req: import('express').Request, res: import('express').Response) => void}
 */
export const handleDelete = (storageRoot) => (req, res) => {
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

  console.log(`Deleting file or folder at: ${relativePath}`)
  fs.rmSync(storagePath, {recursive: isDir, force: true})

  res.redirect("../")
}