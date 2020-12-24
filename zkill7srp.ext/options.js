document.addEventListener('DOMContentLoaded', () => {
  chrome.storage.sync.get({
    names: '',
    oneclick: false,
    keeptrack: false
  }, function(items) {
    document.getElementById('pilots').value = items.names;
    document.getElementById('oneclickapply').checked = items.oneclick;
    document.getElementById('keeptrack').checked = items.keeptrack;
  });
});

document.getElementById('save').addEventListener('click', () => {
  const names = document.getElementById('pilots').value;
  const oneclick = document.getElementById('oneclickapply').checked;
  const keeptrack = document.getElementById('keeptrack').checked;
  chrome.storage.sync.set({
    names: names,
    oneclick: oneclick,
    keeptrack: keeptrack
  }, function() {
    const status = document.getElementById('status');
    status.textContent = 'Options saved.';
    setTimeout(function() {
      status.textContent = '';
    }, 750);
  });
});

document.getElementById('clear').addEventListener('click', () => {
  chrome.storage.sync.remove('applied');
});
