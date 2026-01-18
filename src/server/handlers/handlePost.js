import path from 'node:path'
import fs from 'node:fs'
import busboy from 'busboy'
import { renderDirPage } from '../dirPage.js'
import { handleDelete } from './handleDelete.js'

const folderPathRegex = /^[a-zA-Z0-9\-_ ]+$/

/**
 * 
 * @param {string} storageRoot - Path to storage root
 * @returns {(req: import('express').Request, res: import('express').Response) => Promise<void>}
 */
export const handlePost = (storageRoot) => async (req, res) => {
  const reqPath = decodeURI(req.path)
  const storagePath = path.join(storageRoot, reqPath)
  const relativePath = path.relative(storageRoot, storagePath)
  const exists = fs.existsSync(storagePath)
  if (!exists) {
    res.status(404).send("File not found!")
    return
  }

  const stats = fs.statSync(storagePath)
  const isDir = stats.isDirectory()

  if (req.body?.delete) {
    handleDelete(storageRoot)(req, res)
    return
  }

  if (!isDir) {
    res.status(400).send("Can not upload to file path.")
  }

  if (req.body?.createFolder) {
    const folderName = req.body.folderName
    console.log(`Creating ${folderName} in ${relativePath}`)

    if (!folderPathRegex.test(folderName)) {
      res.status(400).send("Can not create folder, invalid folder name.")
      return
    }


    fs.mkdirSync(path.join(storagePath, folderName))
  }

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
}