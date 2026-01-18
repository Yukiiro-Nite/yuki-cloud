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
      isFile: stats.isFile(),
      lastModifiedDate: stats.mtime.toISOString(),
      createdAtDate: stats.birthtime.toISOString(),
      size: stats.size,
      sizeDisplay: bytesToDisplay(stats.size)
    }
  })
  const systemStats = fs.statfsSync(storageRoot)
  const storageStats = fs.statSync(storageRoot)
  const systemTotal = systemStats.blocks * systemStats.bsize
  const systemAvailable = systemStats.bavail * systemStats.bsize
  const systemUsed = systemTotal - systemAvailable
  const storageTotal = systemAvailable + storageStats.size
  const storageUsed = storageStats.size

  const dirHTML = mustache.render(directoryView, {
    path: relativePath,
    breadcrumbs: breadcrumbs,
    files: files,
    stats: {
      systemTotal,
      systemTotalDisplay: bytesToDisplay(systemTotal),
      systemAvailable,
      systemAvailableDisplay: bytesToDisplay(systemAvailable),
      systemUsed,
      systemUsedDisplay: bytesToDisplay(systemUsed),
      storageTotal,
      storageTotalDisplay: bytesToDisplay(storageTotal),
      storageUsed,
      storageUsedDisplay: bytesToDisplay(storageUsed)
    }
  })

  return dirHTML
}

const sizes = [
  "B",
  "KB",
  "MB",
  "GB"
]

/**
 * 
 * @param {number} bytes
 * @returns {string}
 */
export const bytesToDisplay = (bytes) => {
  let total = bytes
  let i

  for (i=0; i<sizes.length && total > 1024; i++) {
    total = total / 1024
  }

  const amount = i > 0
    ? total.toFixed(2)
    : total
  const unit = sizes[i] || "TB"
  return `${amount} ${unit}`
}