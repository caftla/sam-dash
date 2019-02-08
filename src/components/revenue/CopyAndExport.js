export const copyToClipboard = (str) => {
  document.getElementById('copyButton').innerText = 'Link Copied!';
  const el = document.createElement('textarea');
  el.value = str;
  document.body.appendChild(el);
  el.select();
  document.execCommand('copy');
  document.body.removeChild(el);
  setTimeout(() => {
    document.getElementById('copyButton').innerText = 'Copy Link'
  }, 1000);
};

export const export_json_to_excel = (e, data, props) => {
  e.preventDefault();
  document.getElementById('exportButton').innerText = 'File Downloading..'

  const { breakdown, date_from, date_to } = props;

  /* make the worksheet */
  var ws = XLSX.utils.json_to_sheet(data);

  /* add to workbook */
  var wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Revenue");

  /* write workbook (use type 'binary') */
  var wbout = XLSX.write(wb, {bookType:'xlsx', type:'binary'});

  /* generate a download */
  function s2ab(s) {
  var buf = new ArrayBuffer(s.length);
  var view = new Uint8Array(buf);
  for (var i=0; i!=s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
  return buf;
  }

  saveAs(new Blob([s2ab(wbout)],{type:"application/octet-stream"}), 
    `Revenue-${breakdown}-${date_from}-${date_to}.csv`);
    setTimeout(() => {
        document.getElementById('exportButton').innerText = 'Export'
      }, 1000);

}