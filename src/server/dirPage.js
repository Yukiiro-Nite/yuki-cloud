import path from 'node:path'
import fs from 'node:fs'
import mustache from 'mustache'

const directoryView = fs.readFileSync(
  path.join(process.cwd(), 'src/client/directoryView.html.mustache'),
  'utf-8'
)

export const renderDirPage = (
  storageRoot,
  storagePath,
  relativePath
) => {
  const pathParts = !relativePath
    ? []
    : relativePath.split(path.sep)
  const breadcrumbs = pathParts.map((name, index) => ({
    name,
    route: path.join(...pathParts.slice(0, index+1))
  }))
  const fileNames = fs.readdirSync(storagePath)
  const files = fileNames.map((file) => {
    const filePath = path.join(storagePath, file)
    const relativeFilePath = path.relative(storageRoot, filePath)
    const stats = fs.statSync(filePath)
    
    return {
      name: file,
      route: relativeFilePath,
      isDir: stats.isDirectory(),
      isFile: stats.isFile()
    }
  })

  const dirHTML = mustache.render(directoryView, {
    path: relativePath,
    breadcrumbs: breadcrumbs,
    files: files
  })

  return dirHTML
}