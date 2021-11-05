export default function downloadJSON(document: Document, content: string, filename: string) {
  const element = document.createElement('a')
  const file = new Blob([content], { type: 'application/json' })
  element.href = URL.createObjectURL(file)
  element.download = filename
  document.body.appendChild(element)
  element.click()
}
