import path from "path"
import { PDFMargin, launch } from "puppeteer"
import ejs from 'ejs'

/**
 * render document from template
 */
export async function renderDocumentFromTemplate(
  template: string,
  data?: ejs.Data,
  margin?: PDFMargin,
): Promise<Buffer> {
  const filePath = path.join(
    __dirname,
    '../templates',
    template.replace('/', '') + '.ejs',
  )

  const content = await ejs.renderFile(filePath, data)

  const browser = await launch({
    headless: true,
    executablePath: '/usr/bin/chromium-browser',
    args: [
      '--no-sandbox',
      '--headless',
      '--disable-gpu',
      '--disable-dev-shm-usage',
    ],
  })
  const page = await browser.newPage()
  await page.setContent(content)

  const buffer = await page.pdf({
    format: 'A4',
    printBackground: true,
    margin: margin ?? {
      left: '40px',
      top: '40px',
      right: '40px',
      bottom: '40px',
    },
  })

  await browser.close()

  return buffer
}