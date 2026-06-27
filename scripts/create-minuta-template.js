/**
 * Run once: node scripts/create-minuta-template.js
 * Creates public/templates/minuta_template.docx with placeholder tags
 * for docxtemplater to fill in.
 */
const PizZip = require('pizzip')
const Docxtemplater = require('docxtemplater')
const fs = require('fs')
const path = require('path')

// Minimal OOXML document with all placeholders
const XML = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:wpc="http://schemas.microsoft.com/office/word/2010/wordprocessingCanvas"
  xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
<w:body>

<w:p><w:pPr><w:jc w:val="center"/><w:rPr><w:b/><w:sz w:val="32"/></w:rPr></w:pPr>
  <w:r><w:rPr><w:b/><w:sz w:val="32"/></w:rPr><w:t>{NOTARIA_NOMBRE}</w:t></w:r></w:p>

<w:p><w:pPr><w:jc w:val="center"/></w:pPr>
  <w:r><w:rPr><w:sz w:val="20"/></w:rPr><w:t>{NOTARIA_CIF} · {NOTARIA_DIR}</w:t></w:r></w:p>

<w:p><w:pPr><w:jc w:val="center"/></w:pPr>
  <w:r><w:rPr><w:b/><w:sz w:val="28"/></w:rPr><w:t>MINUTA NOTARIAL — BORRADOR</w:t></w:r></w:p>

<w:p>
  <w:r><w:t>Expediente: {EXPEDIENTE_ID}   ·   Cliente: {CLIENTE}   ·   Tipo: {TIPO_ACTO}   ·   Valor: {VALOR}</w:t></w:r></w:p>

<w:p><w:r><w:t xml:space="preserve"> </w:t></w:r></w:p>

<w:p><w:r><w:rPr><w:rFonts w:ascii="Georgia" w:hAnsi="Georgia"/><w:sz w:val="24"/></w:rPr>
  <w:t>{MINUTA_TEXTO}</w:t></w:r></w:p>

<w:p><w:r><w:t xml:space="preserve"> </w:t></w:r></w:p>

<w:p><w:pPr><w:pBdr><w:top w:val="single" w:sz="4" w:space="1"/></w:pBdr></w:pPr>
  <w:r><w:rPr><w:sz w:val="16"/><w:color w:val="94A3B8"/></w:rPr>
  <w:t>⚠ {AVISO_LEGAL}</w:t></w:r></w:p>

<w:p><w:r><w:rPr><w:sz w:val="16"/><w:color w:val="94A3B8"/></w:rPr>
  <w:t>Generado: {FECHA_EMISION} a las {HORA_EMISION} · NotaFlow</w:t></w:r></w:p>

<w:sectPr>
  <w:pgMar w:top="1440" w:right="1080" w:bottom="1440" w:left="1080"/>
</w:sectPr>
</w:body>
</w:document>`

const outDir = path.join(__dirname, '..', 'public', 'templates')
fs.mkdirSync(outDir, { recursive: true })

const zip = new PizZip()
zip.file('word/document.xml', XML)
zip.file('[Content_Types].xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`)
zip.file('_rels/.rels', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`)
zip.file('word/_rels/document.xml.rels', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
</Relationships>`)

const buf = zip.generate({ type: 'nodebuffer', compression: 'DEFLATE' })
const outPath = path.join(outDir, 'minuta_template.docx')
fs.writeFileSync(outPath, buf)
console.log('Template created:', outPath)
