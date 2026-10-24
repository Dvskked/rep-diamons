const fs=require('fs');
let d=fs.readFileSync('F:\\proyec-diamons\\static\\app.js','utf8');
const old = '<button type=\"button\" class=\"fc-card fc- reveal\" data-id=\"\" style=\"\">\\n      \\n    </button>';
const neu = '<div role=\"button\" tabindex=\"0\" class=\"fc-card fc-' + '' + ' reveal\" data-id=\"' + '' + '\" style=\"' + '' + '\">' + '\\n      ' + '' + '\\n    </div>';
// easier: do direct replacement
d = d.replace('<button type="button" class="fc-card fc- reveal" data-id="" style="">\\n      \\n    </button>', '<div role="button" tabindex="0" class="fc-card fc- reveal" data-id="" style="">\\n      \\n    </div>');
fs.writeFileSync('F:\\proyec-diamons\\static\\app.js',d);
