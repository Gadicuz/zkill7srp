const allianceName = 'Sev3rance';
const maxKillAge = 35; // days

function sev3ranceSRP(options) {
  const now = Date.now();
  const maxAge = maxKillAge*24*60*60*1000;

  function getElementByXpath(path) {
    return document.evaluate(path, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
  }

  function isSRPable(killtime, name, ship, alliance) {
    if (isNaN(killtime)) return false; // bad date
    if (allianceName != alliance) return false; // wrong alliance
    if (!name) return false; // bad name
    if (!ship || ship == 'Capsule') return false; // bad ship

    if (now - killtime > maxAge) return false; // too old

    return options.names
      .split(/\r?\n/)
      .map((n) => n.toLowerCase())
      .indexOf(name.toLowerCase()) >= 0;
  }

  function isReported(id) {
    return id in options.applied;
  }

  function processKill() {
    const parentXPath = '/html/body/div[1]/div[2]/span/div[3]';
    const tablesXPath = '/html/body/div[1]/div[2]/span/div[2]/table/tbody/tr[1]/td[2]/div';
    const pilotXPath = tablesXPath + '/table[1]/tbody';
    const infoXPath = tablesXPath + '/table[2]/tbody';
  
    const pilotInfo = getElementByXpath(pilotXPath+'/tr/td[3]').innerText.split(/\r?\n/);
    const killInfo = Array.from(getElementByXpath(infoXPath).children)
      .map((tr) => [tr.getElementsByTagName('th')[0].innerText, tr.getElementsByTagName('td')[0].innerText])
      .reduce((d, [k,v]) => { d[k.slice(0,-1)] = v; return d; }, {});
  
    const killtime = Date.parse(killInfo['Time']);
    const ship = killInfo['Ship'].split('(')[0].trim();
    if (!isSRPable(killtime, pilotInfo[0], ship, pilotInfo[2])) return;
  
    const srpDiv = document.createElement("div");
    const parentNode = getElementByXpath(parentXPath);
    parentNode.insertBefore(srpDiv, parentNode.firstChild);
  
    const killmailLink = window.location.href
    const id = killmailLink.split('/').slice(-2)[0];
    if (isReported(id)) {
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
      '      <option value="Coalition Operation">Coalition Operation (Coalition CTA)</option>' +
      '      <option value="Defense  Fleet">Defense Fleet</option>' +
      '      <option value="Roam">Roam</option>' +
      '      <option value="CTA">-7- Structure/TCU/IHUB Defense (-7- CTA)</option>' +
      '    </select>' +
      '  </div>' +
      '  <center><button class="btn btn-primary btn-block" type="submit"><b>Apply for -7- SRP</b></button></center>' +
      '</form>';
  
    srpDiv.firstChild.addEventListener("submit", function() {
      //const formURL = 'https://docs.google.com/forms/d/e/1FAIpQLSchifEv2MwCKYBmaEbGj8k4ANBo1VfJJQW1iKkXouw2wZGmew/';
      const formURL = 'https://docs.google.com/forms/d/e/1FAIpQLSf8xk70lcZiMtwC5eljXkv4Tn9s8uL64Lw355445NlK8Aulrg/';
  
      const fcname = document.getElementsByName('srp_fleet_commander')[0].value;
      const optype = document.getElementsByName('srp_operation_type')[0].value;
      const isCTA = optype == 'CTA';
  
      const params = new URLSearchParams('usp=pp_url');
      params.set('entry.1388419113', pilotInfo[0]);
      params.set('entry.1920574619', killmailLink);
      params.set('entry.738739111', ship);
      params.set('entry.541327189', fcname);
      params.set('entry.344009997', optype);
      params.set('entry.1236858744', killInfo['Total'].split(' ')[0]);
//      params.set('entry.1912715229', <comment here>);
      params.set('entry.1462936448', killInfo['Time']);
      params.set('entry.977449600', isCTA ? "Yes" : "No");
      params.set('entry.1260941969', isCTA ? "Yes" : "No");
  
      if (options.oneclick) {
        params.set('pageHistory', isCTA ? '0,1,2,3,5' : '0,1,-3');
        params.set('submit', 'Submit');
      }
      
      if (options.keeptrack) {
        chrome.storage.sync.set({ applied: options.applied });
      }
      
      const url = formURL + (options.oneclick ? 'formResponse' : 'viewform') + '?' + params.toString();
  
      window.location.href = url;
    });
  }

  function processList() {
    if (!options.keeptrack) return;
    const elm = document.getElementById("killmailstobdy");
    if (!elm) return;
    let date = '';
    const list = Array.from(elm.children);
    list.forEach((e) => {
      if (e.classList.contains("tr-date")) { // date row
        date = e.getAttribute("date");
      } 
      if (!date || !e.classList.contains("killListRow")) return;
      const killid = e.getAttribute("killid");
      if (isReported(killid)) return; // already reported
      const killtime = e.children[0].innerText.split(/\r?\n/)[0].trim(); //time
      const killdatetime = Date.parse(date + " " + killtime);
      const cVictim = e.children[4];
      const vData = cVictim.innerText.split(/[()]/).map((s) => s.trim()); // Name, Ship, Alliance
      if (!isSRPable(killdatetime, ...vData)) return;
      const srpHint = document.createElement("a");
      srpHint.setAttribute("href", "/kill/"+killid+"/");
      srpHint.innerHTML = '<small><font class="alert alert-warning" style="padding: 0px; margin: 0px;">&nbsp;SRP&nbsp;</font></small>';
      cVictim.appendChild(srpHint);
    });
  }

  if (window.location.pathname.startsWith("/kill/"))
    processKill();
  else
    processList();
}

chrome.storage.sync.get({
  names: '',
  oneclick: false,
  keeptrack: false,
  applied: {}
}, function(options) {
  sev3ranceSRP(options);
});

