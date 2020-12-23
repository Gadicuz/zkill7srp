function sev3ranceSRP(options) {
  function getElementByXpath(path) {
    return document.evaluate(path, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
  }
  const parentXPath = '/html/body/div[1]/div[2]/span/div[3]';
  const tablesXPath = '/html/body/div[1]/div[2]/span/div[2]/table/tbody/tr[1]/td[2]/div';
  const pilotXPath = tablesXPath + '/table[1]/tbody/tr/td[3]/a[1]';
  const dataXPath = tablesXPath + '/table[2]/tbody'
  const shipXPath = dataXPath + '/tr[1]/td/a';
  const relatedXPath = dataXPath + '/tr[2]/th';
  const related = getElementByXpath(relatedXPath).innerHTML == 'Related:';
  const timeXPath = dataXPath + (related ? '/tr[5]/td' : '/tr[4]/td');
  const totalXPath = dataXPath + (related ? '/tr[11]/td/strong' : '/tr[10]/td/strong');


  const maxAge = 35*24*60*60*1000;
  const timeOfKill = getElementByXpath(timeXPath).innerHTML;
  const killdate = Date.parse(timeOfKill);
  if (isNaN(killdate)) return; // bad date
  const now = Date.now();
  if (now - killdate > maxAge) return; // too old
//  const milestone = new Date('January 1, 2021 00:00:00');
//  if (now >= milestone && milestone > killdate) return; // after Jan 1, 2021 only

  const names = options.names.split(/\r?\n/);
  const pilotName = getElementByXpath(pilotXPath).innerHTML
  if (names.indexOf(pilotName) < 0) return;

  const killmailLink = window.location.href

  const parentElement = getElementByXpath(parentXPath);
  const formElement = document.createElement("div");

  const id = killmailLink.split('/').slice(-2)[0];
  if (id in options.applied) {
    formElement.classList.add("alert", "alert-success");
    formElement.innerHTML = '-7- SRP request is already submitted';
    parentElement.insertBefore(formElement, parentElement.firstChild);
    return;
  }
  // remove outdated
  Object.entries(options.applied)
    .filter(([,ts]) => now-ts > maxAge)
    .map(([id,]) => id)
    .forEach(id => delete options.applied[id]);
  // add new kill
  options.applied[id] = killdate;

  const shipType = getElementByXpath(shipXPath).innerHTML
  const totalLoss = getElementByXpath(totalXPath).innerHTML

  formElement.classList.add("alert", "alert-warning"); // -success -danger -info

  const form = document.createElement("form");
  form.classList.add('form');
  form.setAttribute('onsubmit', "return false");
  form.addEventListener("submit", applyForSRP);

  const group1 = document.createElement("div");
  group1.classList.add('form-group');

  const group2 = document.createElement("div");
  group2.classList.add('form-group');

  const fc = document.createElement("input");
  fc.classList.add('form-control');
  fc.setAttribute('type',"text");
  fc.setAttribute('name',"fleet_commander");
  fc.setAttribute('required',"");
  fc.setAttribute('placeholder',"Fleet commander name");

  function option(text, val) {
    const o = document.createElement("option");
    o.setAttribute('value',val);
    o.innerHTML = text;
    return o;
  }
  const op = document.createElement("select");
  op.classList.add('form-control');
  op.setAttribute('name',"operation_type");
  op.setAttribute('required',"");
  op.setAttribute('title',"Select operation type...");
  op.appendChild(option('Defense Fleet', 'Defense  Fleet'));
  op.appendChild(option('Roam', 'Roam'));
  op.appendChild(option('Coalition Operation', 'Coalition Operation'));
  op.appendChild(option('CTA for -7- TCU/IHUB defense', 'CTA'));
  op.appendChild(option('CTA for -7- structure defense', 'CTA'));

  const s = document.createElement("input");
  s.setAttribute('type',"submit");
  s.setAttribute('value',"Apply for -7- SRP");
  s.classList.add("btn", "btn-primary");

  group1.appendChild(fc);
  group2.appendChild(op);
  form.appendChild(group1);
  form.appendChild(group2);
  form.appendChild(s);
  formElement.appendChild(form);

  parentElement.insertBefore(formElement, parentElement.firstChild);

  function applyForSRP() {
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

    url = url.replace('{name}', encodeURIComponent(pilotName));
    url = url.replace('{killid}', encodeURIComponent(killmailLink));
    url = url.replace('{ship}', encodeURIComponent(shipType));
    url = url.replace('{fc}', encodeURIComponent(fc.value));
    url = url.replace('{total}', encodeURIComponent(totalLoss.split(' ')[0]));
    url = url.replace('{time}', encodeURIComponent(timeOfKill));
    url = url.replace('{optype}', encodeURIComponent(op.value));
    const isCTA = encodeURIComponent(op.value == 'CTA' ? "Yes" : "No");
    url = url.replace('{cta1}', isCTA);
    url = url.replace('{cta2}', isCTA);

    if (options.keeptrack) {
      chrome.storage.sync.set({ applied: options.applied });
    }
    
    window.location.href = url;
  }
}

chrome.storage.sync.get({
  names: '',
  oneclick: false,
  keeptrack: false,
  applied: {}
}, function(options) {
  sev3ranceSRP(options);
});

