function sev3ranceSRP(options) {
  function getElementByXpath(path) {
    return document.evaluate(path, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
  }
  const parentXPath = '/html/body/div[1]/div[2]/span/div[3]';
  const tablesXPath = '/html/body/div[1]/div[2]/span/div[2]/table/tbody/tr[1]/td[2]/div';
  const pilotXPath = tablesXPath + '/table[1]/tbody';
  const infoXPath = tablesXPath + '/table[2]/tbody';

  const pilotInfo = getElementByXpath(pilotXPath+'/tr/td[3]').innerText.split(/\r?\n/);
  const killInfo = Array.from(getElementByXpath(infoXPath).children)
    .map((tr) => [tr.getElementsByTagName('th')[0].innerText, tr.getElementsByTagName('td')[0].innerText])
    .reduce((d, [k,v]) => { d[k.slice(0,-1)] = v; return d; }, {});

  const maxAge = 35*24*60*60*1000;
  const killtime = Date.parse(killInfo['Time']);
  if (isNaN(killtime)) return; // bad date
  const now = Date.now();
  if (now - killtime > maxAge) return; // too old
//  const milestone = new Date('January 1, 2021 00:00:00');
//  if (now >= milestone && milestone > killtime) return; // after Jan 1, 2021 only

  const names = options.names.split(/\r?\n/);
  if (names.indexOf(pilotInfo[0]) < 0) return;

  const srpDiv = document.createElement("div");
  const parentNode = getElementByXpath(parentXPath);
  parentNode.insertBefore(srpDiv, parentNode.firstChild);

  const killmailLink = window.location.href
  const id = killmailLink.split('/').slice(-2)[0];
  if (id in options.applied) {
    srpDiv.classList.add("alert", "alert-success");
    srpDiv.innerHTML = '<center>-7- SRP request is already submitted</center>';
    return;
  }
  // remove outdated
  Object.entries(options.applied)
    .filter(([,ts]) => now-ts > maxAge)
    .map(([id,]) => id)
    .forEach(id => delete options.applied[id]);
  // add new kill
  options.applied[id] = killtime;

  srpDiv.classList.add("alert", "alert-warning"); // -success -danger -info
  srpDiv.innerHTML = 
    '<form class="form" onsubmit="return false">' +
    '  <div class="form-group">' +
    '    <input class="form-control" required type="text" name="srp_fleet_commander" placeholder="Fleet commander name">' +
    '  </div>' +
    '  <div class="form-group">' +
    '    <select class="form-control" required name="srp_operation_type">' +
    '      <option selected value="">Choose operation type...</option>' +
    '      <option value="Defense  Fleet">Defense Fleet</option>' +
    '      <option value="Roam">Roam</option>' +
    '      <option value="Coalition Operation">Coalition Operation</option>' +
    '      <option value="CTA">CTA for -7- TCU/IHUB Defence (Final Timer)</option>' +
    '      <option value="CTA">CTA for -7- Structure (Final Timer)</option>' +
    '    </select>' +
    '  </div>' +
    '  <center><button class="btn btn-primary btn-block" type="submit"><b>Apply for -7- SRP</b></button></center>' +
    '</form>';

  srpDiv.firstChild.addEventListener("submit", function() {
//    const filledSRPFormURL = 'https://docs.google.com/forms/d/e/1FAIpQLSewuizATw-4rEnS2tNnG-abdWplIj8TVWgD5wVirDB60Ub13A/viewform?' +
      const filledSRPFormURL = 'https://docs.google.com/forms/d/e/1FAIpQLSf8xk70lcZiMtwC5eljXkv4Tn9s8uL64Lw355445NlK8Aulrg/viewform?' +
                           'usp=pp_url&' +
                           'entry.1388419113={name}&' +
                           'entry.1920574619={killid}&' +
                           'entry.738739111={ship}&' +
                           'entry.541327189={fc}&' +
                           'entry.344009997={optype}&' +
                           'entry.1236858744={total}&' +
//                           'entry.1912715229={comment}&' +
                           'entry.977449600={cta1}&' +
                           'entry.1260941969={cta2}&' +
                           'entry.1462936448={time}';

    let url = filledSRPFormURL;

    if (options.oneclick) {
      url = url.replace('viewform', 'formResponse');
      url = url + '&' + 'pageHistory=0,1,2,3,4,5';
      url = url + '&' + 'submit=Submit';
    }

    const fcname = document.getElementsByName('srp_fleet_commander')[0].value;
    const optype = document.getElementsByName('srp_operation_type')[0].value;
    const isCTA = encodeURIComponent(optype == 'CTA' ? "Yes" : "No");
    url = url.replace('{name}', encodeURIComponent(pilotInfo[0]));
    url = url.replace('{killid}', encodeURIComponent(killmailLink));
    url = url.replace('{ship}', encodeURIComponent(killInfo['Ship'].split('(')[0].trim()));
    url = url.replace('{fc}', encodeURIComponent(fcname));
    url = url.replace('{total}', encodeURIComponent(killInfo['Total'].split(' ')[0]));
    url = url.replace('{time}', encodeURIComponent(killInfo['Time']));
    url = url.replace('{optype}', encodeURIComponent(optype));
    url = url.replace('{cta1}', isCTA);
    url = url.replace('{cta2}', isCTA);

    if (options.keeptrack) {
      chrome.storage.sync.set({ applied: options.applied });
    }
    
    window.location.href = url;
  });
}

chrome.storage.sync.get({
  names: '',
  oneclick: false,
  keeptrack: false,
  applied: {}
}, function(options) {
  sev3ranceSRP(options);
});

