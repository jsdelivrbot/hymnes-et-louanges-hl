(function() {

  /**
   * @module
   * @desc Defines application's constant constiables
   */

  const exporter = require('./exports');


  /**
   * Non english character map to an equivalent
   */
  const SEARCH_REPLACE_MAP =  {
    'à': 'a',
    'á': 'a',
    'â': 'a',
    'ä': 'a',
    'æ': 'ae',
    'ã': 'a',
    'å': 'a',
    'ā': 'a',
    'è': 'e',
    'é': 'e',
    'ê': 'e',
    'ë': 'e',
    'ē': 'e',
    'ė': 'e',
    'ę': 'e',
    'î': 'i',
    'ï': 'i',
    'í': 'i',
    'ī': 'i',
    'į': 'i',
    'ì': 'i',
    'ô': 'o',
    'ö': 'o',
    'ò': 'o',
    'ó': 'o',
    'œ': 'oe',
    'ø': 'o',
    'ō': 'o',
    'õ': 'o',
    'û': 'u',
    'ü': 'u',
    'ù': 'u',
    'ú': 'u',
    'ū': 'u',
    'ÿ': 'y',
    'ç': 'c',
    'ć': 'c',
    'č': 'c',
    'ý': 'y',
    'ñ': 'n'
  };

  const SEARCH_IGNORE_MAP = {
    'i': 1,
    'a': 1,
    'all': 1,
    'also': 1,
    'an': 1,
    'and': 1,
    'are': 1,
    'as': 1,
    'at': 1,
    'be': 1,
    'been': 1,
    'but': 1,
    'by': 1,
    'can': 1,
    'do': 1,
    'for': 1,
    'go': 1,
    'had': 1,
    'have': 1,
    'he': 1,
    'him': 1,
    'his': 1,
    'is': 1,
    'it': 1,
    'no': 1,
    'not': 1,
    'of': 1,
    'on': 1,
    'that': 1,
    'the': 1,
    'thei': 1,
    'them': 1,
    'they': 1,
    'this': 1,
    'to': 1,
    'up': 1,
    'upon': 1,
    'was': 1,
    'we': 1,
    'were': 1,
    'who': 1,
    'will': 1,
    'with': 1
  };

  exporter.publicize(module, {

    SEARCH_REPLACE_MAP,

    SEARCH_IGNORE_MAP,

    SEARCH_REPLACE_REGEX: new RegExp(
       Object.keys(SEARCH_REPLACE_MAP).join('|'), 'gi'), 

    SEARCH_KEY_END_IGNORE: {
      // Minimun length to start considering
      length: 5,
      // Those will be replace by an empty character
      remove: ['s', 'r', 'x', 'z']
    },

    /**
     * Regex to filter emails
     */
    EMAIL_FILTER: /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/, 

    /**
     * Default page for pagination.
     */
    PAGE: 1, 

    /**
     * How many item to show in pagination mode
     */
    SLICE: 10, 

    EXTENSIONS: { 
      json: 'js.png',
      sass: 'css.png',
      scss: 'css.png',
      '3dm': '3dm.png',
      '3ds': '3ds.png',
      '3g2': '3g2.png',
      '3gp': '3gp.png',
      '7z': '7z.png',
      aac: 'aac.png',
      ai: 'ai.png',
      aif: 'aif.png',
      apk: 'apk.png',
      app: 'app.png',
      asf: 'asf.png',
      asp: 'asp.png',
      aspx: 'aspx.png',
      asx: 'asx.png',
      avi: 'avi.png',
      bak: 'bak.png',
      bat: 'bat.png',
      bin: 'bin.png',
      bmp: 'bmp.png',
      cab: 'cab.png',
      cad: 'cad.png',
      cdr: 'cdr.png',
      cer: 'cer.png',
      cfg: 'cfg.png',
      cfm: 'cfm.png',
      cgi: 'cgi.png',
      'class': 'class.png',
      'java': 'class.png',
      com: 'com.png',
      cpl: 'cpl.png',
      cpp: 'cpp.png',
      crx: 'crx.png',
      csr: 'csr.png',
      css: 'css.png',
      csv: 'csv.png',
      cue: 'cue.png',
      cur: 'cur.png',
      dat: 'dat.png',
      db: 'db.png',
      dbf: 'dbf.png',
      dds: 'dds.png',
      dem: 'dem.png',
      dll: 'dll.png',
      dmg: 'dmg.png',
      dmp: 'dmp.png',
      doc: 'doc.png',
      docx: 'docx.png',
      drv: 'drv.png',
      dtd: 'dtd.png',
      dwg: 'dwg.png',
      dxf: 'dxf.png',
      elf: 'elf.png',
      eps: 'eps.png',
      exe: 'exe.png',
      fla: 'fla.png',
      flash: 'flash.png',
      flv: 'flv.png',
      fnt: 'fnt.png',
      fon: 'fon.png',
      gam: 'gam.png',
      gbr: 'gbr.png',
      ged: 'ged.png',
      gif: 'gif.png',
      gpx: 'gpx.png',
      gz: 'gz.png',
      gzip: 'gzip.png',
      hqz: 'hqz.png',
      html: 'html.png',
      ibooks: 'ibooks.png',
      icns: 'icns.png',
      ico: 'ico.png',
      ics: 'ics.png',
      iff: 'iff.png',
      indd: 'indd.png',
      iso: 'iso.png',
      jar: 'jar.png',
      jpg: 'jpg.png',
      js: 'js.png',
      jsp: 'jsp.png',
      key: 'key.png',
      kml: 'kml.png',
      kmz: 'kmz.png',
      lnk: 'lnk.png',
      log: 'log.png',
      lua: 'lua.png',
      m4a: 'm4a.png',
      m4v: 'm4v.png',
      macho: 'macho.png',
      max: 'max.png',
      mdb: 'mdb.png',
      mdf: 'mdf.png',
      mid: 'mid.png',
      mim: 'mim.png',
      mov: 'mov.png',
      mp3: 'mp3.png',
      mp4: 'mp4.png',
      mpa: 'mpa.png',
      mpg: 'mpg.png',
      msg: 'msg.png',
      msi: 'msi.png',
      mu: 'mu.png',
      nes: 'nes.png',
      object: 'object.png',
      odb: 'odb.png',
      odc: 'odc.png',
      odf: 'odf.png',
      odg: 'odg.png',
      odi: 'odi.png',
      odp: 'odp.png',
      ods: 'ods.png',
      odt: 'odt.png',
      odx: 'odx.png',
      ogg: 'ogg.png',
      otf: 'otf.png',
      PAGEs: 'PAGEs.png',
      pct: 'pct.png',
      pdb: 'pdb.png',
      pdf: 'pdf.png',
      pif: 'pif.png',
      pkg: 'pkg.png',
      pl: 'pl.png',
      png: 'png.png',
      pps: 'pps.png',
      ppt: 'ppt.png',
      pptx: 'pptx.png',
      ps: 'ps.png',
      psd: 'psd.png',
      pub: 'pub.png',
      py: 'py.png',
      ra: 'ra.png',
      rar: 'rar.png',
      raw: 'raw.png',
      rm: 'rm.png',
      rom: 'rom.png',
      rpm: 'rpm.png',
      rss: 'rss.png',
      rtf: 'rtf.png',
      sav: 'sav.png',
      sdf: 'sdf.png',
      sitx: 'sitx.png',
      sql: 'sql.png',
      srt: 'srt.png',
      svg: 'svg.png',
      swf: 'swf.png',
      sys: 'sys.png',
      tar: 'tar.png',
      tex: 'tex.png',
      tga: 'tga.png',
      thm: 'thm.png',
      tiff: 'tiff.png',
      tmp: 'tmp.png',
      torrent: 'torrent.png',
      ttf: 'ttf.png',
      txt: 'txt.png',
      uue: 'uue.png',
      vb: 'vb.png',
      vcd: 'vcd.png',
      vcf: 'vcf.png',
      vob: 'vob.png',
      wav: 'wav.png',
      wma: 'wma.png',
      wmv: 'wmv.png',
      wpd: 'wpd.png',
      wps: 'wps.png',
      wsf: 'wsf.png',
      xhtml: 'xhtml.png',
      xlr: 'xlr.png',
      xls: 'xls.png',
      xlsx: 'xlsx.png',
      xml: 'xml.png',
      yuv: 'yuv.png',
      zip: 'zip.png' 
    }
  });
})();
