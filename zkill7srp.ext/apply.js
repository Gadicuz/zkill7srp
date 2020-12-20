function sev3ranceSRP(options) {
//  console.log("sev3ranceSRP");
  function getElementByXpath(path) {
    return document.evaluate(path, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
  }
  var parentXPath = '/html/body/div[1]/div[2]/span/div[3]';
  var pilotXPath = '/html/body/div[1]/div[2]/span/div[2]/table/tbody/tr[1]/td[2]/div/table[1]/tbody/tr/td[3]/a[1]';
  var shipXPath = '/html/body/div[1]/div[2]/span/div[2]/table/tbody/tr[1]/td[2]/div/table[2]/tbody/tr[1]/td/a';
  var totalXPath = '/html/body/div[1]/div[2]/span/div[2]/table/tbody/tr[1]/td[2]/div/table[2]/tbody/tr[10]/td/strong';
  var timeXPath = '/html/body/div[1]/div[2]/span/div[2]/table/tbody/tr[1]/td[2]/div/table[2]/tbody/tr[4]/td';

  names = options.names.split(/\r?\n/);
  var pilotName = getElementByXpath(pilotXPath).innerHTML
  if (names.indexOf(pilotName) < 0) return;
  var killmailLink = window.location.href
  var shipType = getElementByXpath(shipXPath).innerHTML
  var totalLoss = getElementByXpath(totalXPath).innerHTML
  var timeOfKill = getElementByXpath(timeXPath).innerHTML

  var parentElement = getElementByXpath(parentXPath);

  var formElement = document.createElement("div");
  formElement.classList.add("alert", "alert-warning"); // -success -danger -info

  var form = document.createElement("form");
  form.classList.add('form');
  form.setAttribute('onsubmit', "return false");
  form.addEventListener("submit", applyForSRP);

  var group1 = document.createElement("div");
  group1.classList.add('form-group');

  var group2 = document.createElement("div");
  group2.classList.add('form-group');

  var fc = document.createElement("input");
  fc.classList.add('form-control');
  fc.setAttribute('type',"text");
  fc.setAttribute('name',"fleet_commander");
  fc.setAttribute('required',"");
  fc.setAttribute('placeholder',"Fleet commander name");

  function option(text, val) {
    var o = document.createElement("option");
    o.setAttribute('value',val);
    o.innerHTML = text;
    return o;
  }
  var op = document.createElement("select");
  op.classList.add('form-control');
  op.setAttribute('name',"operation_type");
  op.setAttribute('required',"");
  op.setAttribute('title',"Select operation type...");
  op.appendChild(option('Defense Fleet', 'Defense  Fleet'));
  op.appendChild(option('Roam', 'Roam'));
  op.appendChild(option('Coalition Operation', 'Coalition Operation'));
  op.appendChild(option('CTA for -7- TCU/IHUB defense', 'CTA'));
  op.appendChild(option('CTA for -7- structure defense', 'CTA'));

  var s = document.createElement("input");
  s.setAttribute('type',"submit");
  s.setAttribute('value',"Apply for SRP");
  s.classList.add("btn", "btn-primary");

  group1.appendChild(fc);
  group2.appendChild(op);
  form.appendChild(group1);
  form.appendChild(group2);
  form.appendChild(s);
  formElement.appendChild(form);

  parentElement.insertBefore(formElement, parentElement.firstChild);

  function applyForSRP() {
    var filledSRPFormURL = 'https://docs.google.com/forms/d/e/1FAIpQLSewuizATw-4rEnS2tNnG-abdWplIj8TVWgD5wVirDB60Ub13A/viewform?' +
                           'usp=pp_url' + '&' +
                           'entry.1388419113={0}' + '&' + // pilot name
                           'entry.1920574619={1}' + '&' + // kill mail
                           'entry.738739111={2}' + '&' + // ship
                           'entry.541327189={3}' + '&' + // fc
                           'entry.344009997={4}' + '&' + // op type
                           'entry.1236858744={5}' + '&' +  // loss
                           'entry.977449600={6}' + '&' +  // CTA?
                           'entry.1260941969={7}' + '&' + // CTA?
                           'entry.1462936448={8}'; // time

    var url = filledSRPFormURL;

    if (options.oneclick) {
      url = url.replace('viewform', 'formResponse');
      url = url + '&' + 'pageHistory=0,1,2,3,4,5';
      url = url + '&' + 'submit=Submit';
    }

    url = url.replace('{0}', encodeURIComponent(pilotName));
    url = url.replace('{1}', encodeURIComponent(killmailLink));
    url = url.replace('{2}', encodeURIComponent(shipType));
    url = url.replace('{3}', encodeURIComponent(fc.value));
    url = url.replace('{5}', encodeURIComponent(totalLoss.split(' ')[0]));
    url = url.replace('{8}', encodeURIComponent(timeOfKill));
    url = url.replace('{4}', encodeURIComponent(op.value));
    var isCTA = encodeURIComponent(op.value == 'CTA' ? "Yes" : "No");
    url = url.replace('{6}', isCTA);
    url = url.replace('{7}', isCTA);

    window.location.href = url;
  }
}

chrome.storage.sync.get({
  names: '',
  oneclick: false
}, function(options) {
  sev3ranceSRP(options);
});

