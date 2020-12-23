function save_options() {
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
}

function restore_options() {
  chrome.storage.sync.get({
    names: '',
    oneclick: false,
    keeptrack: false
  }, function(items) {
    document.getElementById('pilots').value = items.names;
    document.getElementById('oneclickapply').checked = items.oneclick;
    document.getElementById('keeptrack').checked = items.keeptrack;
  });
}

function clear_history() {
  chrome.storage.sync.remove('applied');
}

document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click',
    save_options);
document.getElementById('clear').addEventListener('click',
    clear_history);
