/* HidroLaudo – gerador de .docx (OOXML escrito à mão + zip sem compressão). Sem dependências, roda no navegador e no Node. */
(function (G) {
  const HL = G.HL = G.HL || {};
  const enc = new TextEncoder();

  // ---------- zip (store) ----------
  const CRC_T = (() => { const t = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
  function crc32(u8) { let c = 0xFFFFFFFF; for (let i = 0; i < u8.length; i++) c = CRC_T[(c ^ u8[i]) & 255] ^ (c >>> 8); return (c ^ 0xFFFFFFFF) >>> 0; }
  function zip(files) { // files: [{name, data:Uint8Array}]
    const parts = [], central = []; let off = 0;
    const u16 = v => [v & 255, (v >> 8) & 255], u32 = v => [v & 255, (v >> 8) & 255, (v >> 16) & 255, (v >>> 24) & 255];
    files.forEach(f => {
      const name = enc.encode(f.name), crc = crc32(f.data), n = f.data.length;
      const lh = new Uint8Array([0x50, 0x4b, 3, 4, ...u16(20), ...u16(0x0800), ...u16(0), ...u16(0), ...u16(0x21), ...u32(crc), ...u32(n), ...u32(n), ...u16(name.length), ...u16(0)]);
      parts.push(lh, name, f.data);
      central.push(new Uint8Array([0x50, 0x4b, 1, 2, ...u16(20), ...u16(20), ...u16(0x0800), ...u16(0), ...u16(0), ...u16(0x21), ...u32(crc), ...u32(n), ...u32(n), ...u16(name.length), ...u16(0), ...u16(0), ...u16(0), ...u16(0), ...u32(0), ...u32(off)]), name);
      off += lh.length + name.length + n;
    });
    let csize = 0; central.forEach(c => csize += c.length);
    const end = new Uint8Array([0x50, 0x4b, 5, 6, 0, 0, 0, 0, ...u16(files.length), ...u16(files.length), ...u32(csize), ...u32(off), 0, 0]);
    const all = parts.concat(central, [end]);
    let total = 0; all.forEach(a => total += a.length);
    const out = new Uint8Array(total); let p = 0; all.forEach(a => { out.set(a, p); p += a.length; });
    return out;
  }

  // ---------- XML ----------
  const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const TEXT_W = 8787; // largura útil em twips (A4, margens 3,0 / 2,5 cm)

  // "m^{3}/h" -> runs com sobrescrito/subscrito
  function parseRuns(text) {
    const out = []; const re = /([\^_])\{([^}]*)\}/g; let last = 0, m;
    text = String(text);
    while ((m = re.exec(text))) {
      if (m.index > last) out.push({ t: text.slice(last, m.index) });
      out.push({ t: m[2], v: m[1] === '^' ? 'superscript' : 'subscript' });
      last = re.lastIndex;
    }
    if (last < text.length) out.push({ t: text.slice(last) });
    return out;
  }
  function run(t, o = {}) {
    let rp = '';
    if (o.bold) rp += '<w:b/>';
    if (o.italic) rp += '<w:i/>';
    if (o.size) rp += '<w:sz w:val="' + o.size + '"/><w:szCs w:val="' + o.size + '"/>';
    if (o.v) rp += '<w:vertAlign w:val="' + o.v + '"/>';
    const segs = String(t).split('\t');
    let x = '';
    segs.forEach((s, i) => { if (i) x += '<w:tab/>'; if (s) x += '<w:t xml:space="preserve">' + esc(s) + '</w:t>'; });
    return '<w:r>' + (rp ? '<w:rPr>' + rp + '</w:rPr>' : '') + x + '</w:r>';
  }
  function runs(text, o = {}) { return parseRuns(text).map(r => run(r.t, Object.assign({}, o, r.v ? { v: r.v } : {}))).join(''); }
  function para(inner, o = {}) {
    let pp = '';
    if (o.style) pp += '<w:pStyle w:val="' + o.style + '"/>';
    if (o.keepNext) pp += '<w:keepNext/>';
    if (o.tabs) pp += '<w:tabs>' + o.tabs.map(t => '<w:tab w:val="' + t[0] + '" w:pos="' + t[1] + '"/>').join('') + '</w:tabs>';
    if (o.before !== undefined || o.after !== undefined) pp += '<w:spacing' + (o.before !== undefined ? ' w:before="' + o.before + '"' : '') + (o.after !== undefined ? ' w:after="' + o.after + '"' : '') + '/>';
    if (o.ind) pp += '<w:ind ' + o.ind + '/>';
    if (o.align) pp += '<w:jc w:val="' + o.align + '"/>';
    return '<w:p>' + (pp ? '<w:pPr>' + pp + '</w:pPr>' : '') + inner + '</w:p>';
  }
  function cell(inner, w, o = {}) {
    let tc = '<w:tcW w:w="' + w + '" w:type="dxa"/>';
    if (o.span > 1) tc += '<w:gridSpan w:val="' + o.span + '"/>';
    if (o.vMerge) tc += o.vMerge === 'restart' ? '<w:vMerge w:val="restart"/>' : '<w:vMerge/>';
    if (o.shade) tc += '<w:shd w:val="clear" w:color="auto" w:fill="' + o.shade + '"/>';
    tc += '<w:vAlign w:val="center"/>';
    return '<w:tc><w:tcPr>' + tc + '</w:tcPr>' + inner + '</w:tc>';
  }
  function tbl(rowsXml, widths, o = {}) {
    const b = o.noBorders ? '<w:tblBorders><w:top w:val="nil"/><w:left w:val="nil"/><w:bottom w:val="nil"/><w:right w:val="nil"/><w:insideH w:val="nil"/><w:insideV w:val="nil"/></w:tblBorders>'
      : '<w:tblBorders>' + ['top', 'left', 'bottom', 'right', 'insideH', 'insideV'].map(s => '<w:' + s + ' w:val="single" w:sz="4" w:space="0" w:color="808080"/>').join('') + '</w:tblBorders>';
    const total = widths.reduce((a, b) => a + b, 0);
    return '<w:tbl><w:tblPr><w:tblW w:w="' + total + '" w:type="dxa"/><w:jc w:val="center"/>' + b + '<w:tblLayout w:type="fixed"/><w:tblCellMar><w:top w:w="40" w:type="dxa"/><w:left w:w="80" w:type="dxa"/><w:bottom w:w="40" w:type="dxa"/><w:right w:w="80" w:type="dxa"/></w:tblCellMar></w:tblPr>' +
      '<w:tblGrid>' + widths.map(w => '<w:gridCol w:w="' + w + '"/>').join('') + '</w:tblGrid>' + rowsXml + '</w:tbl>';
  }

  // ---------- imagens ----------
  function dataUrlToBytes(u) {
    const m = /^data:(image\/(png|jpeg|jpg));base64,(.*)$/s.exec(u || '');
    if (!m) return null;
    const bin = typeof atob === 'function' ? atob(m[3]) : Buffer.from(m[3], 'base64').toString('binary');
    const a = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) a[i] = bin.charCodeAt(i);
    return { bytes: a, ext: m[2] === 'png' ? 'png' : 'jpeg' };
  }

  function build(blocks) {
    const media = []; let relId = 10, docPrId = 1;
    const body = [];
    const alignMap = { l: 'left', c: 'center', r: 'right' };

    blocks.forEach(b => {
      switch (b.t) {
        case 'cov':
          body.push(para(runs(b.text, { bold: b.bold, size: (b.size || 12) * 2 }), { align: 'center', before: b.before || 0, after: b.after || 0 })); break;
        case 'pb': body.push('<w:p><w:r><w:br w:type="page"/></w:r></w:p>'); break;
        case 'h1': body.push(para(runs(b.num + '\t' + b.text, { bold: true, size: 24 }), { style: 'Heading1', tabs: [['left', 709]], before: 360, after: 120, keepNext: true })); break;
        case 'h2': body.push(para(runs(b.num + '\t' + b.text, { bold: true, size: 22 }), { style: 'Heading2', tabs: [['left', 709]], before: 240, after: 120, keepNext: true })); break;
        case 'h3': body.push(para(runs(b.num + '\t' + b.text, { bold: true, italic: true, size: 22 }), { style: 'Heading3', tabs: [['left', 851]], before: 200, after: 100, keepNext: true })); break;
        case 'p':
          body.push(para(runs(b.text, { bold: b.bold }), { align: b.center ? 'center' : 'both', ind: b.noIndent || b.center ? undefined : 'w:firstLine="709"', before: b.before, after: 120 })); break;
        case 'li':
          body.push(para(runs(b.text), { align: 'both', ind: 'w:left="709"', after: 80 })); break;
        case 'ref':
          body.push(para(runs(b.text), { align: 'both', ind: 'w:left="0"', after: 140 })); break;
        case 'eq':
          body.push(para(runs('\t' + b.text + '\t(' + b.n + ')', { italic: false }), { tabs: [['center', Math.round(TEXT_W / 2)], ['right', TEXT_W]], before: 120, after: 120 })); break;
        case 'kv': {
          const w = b.wide ? [4300, 900, 3587] : [1100, 4600, 3087];
          const rows = b.rows.map(r => '<w:tr>' + r.map((c, i) => cell(para(runs(c), { align: 'left', after: 20 }), w[i])).join('') + '</w:tr>').join('');
          body.push(tbl(rows, w, { noBorders: true }));
          body.push(para('', { after: 60 }));
          break;
        }
        case 'table': {
          const n = b.head.length, tw = TEXT_W;
          const w = b.widths.map(x => Math.round(x / 100 * tw));
          if (b.caption) body.push(para(runs(b.caption, { bold: true, size: 20 }), { align: 'left', before: 160, after: 80, keepNext: true }));
          const sumW = (c, cs) => w.slice(c, c + cs).reduce((a, x) => a + x, 0);
          // keepNext em todas as linhas menos a última: a tabela fica inteira na mesma página
          const rowXml = (row, head, kn) => '<w:tr><w:trPr><w:cantSplit/>' + (head ? '<w:tblHeader/>' : '') + '</w:trPr>' + row.cells.map(p => p.k === 'cont'
            ? cell(para('', { after: 0, keepNext: kn }), sumW(p.c, p.cs), { span: p.cs, vMerge: 'cont', shade: head ? 'E7E6E6' : null })
            : cell(para(runs(p.t, { size: 20, bold: head || p.bold }), { align: head || p.rs > 1 || p.cs > 1 ? 'center' : alignMap[b.align[p.c]] || 'left', after: 0, keepNext: kn }), sumW(p.c, p.cs),
              { span: p.cs, vMerge: p.rs > 1 ? 'restart' : null, shade: head ? 'E7E6E6' : p.shade ? 'D9D9D9' : null })).join('') + '</w:tr>';
          let rows = HL.headGrid(b).map(row => rowXml(row, true, true)).join('');
          const grid = HL.tableGrid(b);
          grid.forEach((row, i) => { rows += rowXml(row, false, i < grid.length - 1); });
          body.push(tbl(rows, w));
          body.push(para('', { after: 120 }));
          break;
        }
        case 'fig': {
          const img = dataUrlToBytes(b.img);
          if (img) {
            const idx = media.length + 1, rid = 'rId' + (relId++);
            media.push({ name: 'image' + idx + '.' + (img.ext === 'png' ? 'png' : 'jpeg'), bytes: img.bytes, rid });
            const maxW = 5400000, maxH = 4900000; // 15 cm × 13,6 cm
            let cx = maxW, cy = Math.round(maxW * ((b.h || 3) / (b.w || 4)));
            if (cy > maxH) { cy = maxH; cx = Math.round(maxH * ((b.w || 4) / (b.h || 3))); }
            const id = docPrId++;
            const dr = '<w:r><w:drawing><wp:inline distT="0" distB="0" distL="0" distR="0"><wp:extent cx="' + cx + '" cy="' + cy + '"/><wp:docPr id="' + id + '" name="Figura ' + id + '"/><wp:cNvGraphicFramePr><a:graphicFrameLocks noChangeAspect="1"/></wp:cNvGraphicFramePr><a:graphic><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:pic><pic:nvPicPr><pic:cNvPr id="' + id + '" name="image' + idx + '"/><pic:cNvPicPr/></pic:nvPicPr><pic:blipFill><a:blip r:embed="' + rid + '"/><a:stretch><a:fillRect/></a:stretch></pic:blipFill><pic:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="' + cx + '" cy="' + cy + '"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></pic:spPr></pic:pic></a:graphicData></a:graphic></wp:inline></w:drawing></w:r>';
            body.push(para(dr, { align: 'center', before: 160, after: 60, keepNext: true }));
          } else {
            body.push(tbl('<w:tr><w:trPr><w:trHeight w:val="2600" w:hRule="atLeast"/></w:trPr>' + cell(para(runs('[ inserir imagem – ' + b.caption.split(' – ')[0] + ' ]', { italic: true, size: 20 }), { align: 'center', after: 0 }), 7800, { shade: 'F2F2F2' }) + '</w:tr>', [7800]));
          }
          body.push(para(runs(b.caption, { bold: true, size: 20 }), { align: 'center', before: 60, after: b.fonte ? 20 : 200 }));
          if (b.fonte) body.push(para(runs(b.fonte, { size: 16 }), { align: 'center', after: 200 }));
          break;
        }
        case 'sig':
          body.push(para('', { before: 700, after: 0 }));
          body.push(para(runs('_______________________________________'), { align: 'center', after: 0 }));
          body.push(para(runs(b.nome || '', { bold: true }), { align: 'center', after: 0 }));
          body.push(para(runs(b.titulo || ''), { align: 'center', after: 0 }));
          body.push(para(runs(b.registro || ''), { align: 'center', after: 0 }));
          break;
      }
    });

    const NS = 'xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture"';
    const sect = '<w:sectPr><w:footerReference w:type="default" r:id="rId3"/><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1418" w:right="1418" w:bottom="1418" w:left="1701" w:header="709" w:footer="709" w:gutter="0"/><w:titlePg/></w:sectPr>';
    const documentXml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document ' + NS + '><w:body>' + body.join('') + sect + '</w:body></w:document>';

    const font = '<w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman" w:eastAsia="Times New Roman"/>';
    const stylesXml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">' +
      '<w:docDefaults><w:rPrDefault><w:rPr>' + font + '<w:sz w:val="22"/><w:szCs w:val="22"/><w:lang w:val="pt-BR"/></w:rPr></w:rPrDefault><w:pPrDefault><w:pPr><w:spacing w:after="120" w:line="276" w:lineRule="auto"/></w:pPr></w:pPrDefault></w:docDefaults>' +
      '<w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/><w:qFormat/></w:style>' +
      '<w:style w:type="paragraph" w:styleId="Heading1"><w:name w:val="heading 1"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:qFormat/><w:pPr><w:keepNext/><w:outlineLvl w:val="0"/></w:pPr><w:rPr><w:b/><w:sz w:val="24"/></w:rPr></w:style>' +
      '<w:style w:type="paragraph" w:styleId="Heading2"><w:name w:val="heading 2"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:qFormat/><w:pPr><w:keepNext/><w:outlineLvl w:val="1"/></w:pPr><w:rPr><w:b/><w:sz w:val="22"/></w:rPr></w:style>' +
      '<w:style w:type="paragraph" w:styleId="Heading3"><w:name w:val="heading 3"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:qFormat/><w:pPr><w:keepNext/><w:outlineLvl w:val="2"/></w:pPr><w:rPr><w:b/><w:i/><w:sz w:val="22"/></w:rPr></w:style>' +
      '</w:styles>';
    const footerXml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:ftr xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:rPr><w:sz w:val="18"/></w:rPr><w:fldChar w:fldCharType="begin"/></w:r><w:r><w:rPr><w:sz w:val="18"/></w:rPr><w:instrText xml:space="preserve"> PAGE </w:instrText></w:r><w:r><w:rPr><w:sz w:val="18"/></w:rPr><w:fldChar w:fldCharType="separate"/></w:r><w:r><w:rPr><w:sz w:val="18"/></w:rPr><w:t>1</w:t></w:r><w:r><w:rPr><w:sz w:val="18"/></w:rPr><w:fldChar w:fldCharType="end"/></w:r></w:p></w:ftr>';
    const docRels = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
      '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>' +
      '<Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/footer" Target="footer1.xml"/>' +
      media.map(m => '<Relationship Id="' + m.rid + '" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/' + m.name + '"/>').join('') + '</Relationships>';
    const rels = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>';
    const types = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Default Extension="png" ContentType="image/png"/><Default Extension="jpeg" ContentType="image/jpeg"/>' +
      '<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/><Override PartName="/word/footer1.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.footer+xml"/></Types>';

    const files = [
      { name: '[Content_Types].xml', data: enc.encode(types) },
      { name: '_rels/.rels', data: enc.encode(rels) },
      { name: 'word/document.xml', data: enc.encode(documentXml) },
      { name: 'word/styles.xml', data: enc.encode(stylesXml) },
      { name: 'word/footer1.xml', data: enc.encode(footerXml) },
      { name: 'word/_rels/document.xml.rels', data: enc.encode(docRels) }
    ].concat(media.map(m => ({ name: 'word/media/' + m.name, data: m.bytes })));
    return zip(files);
  }

  Object.assign(HL, { buildDocx: build, parseRuns });
})(typeof globalThis !== 'undefined' ? globalThis : window);
