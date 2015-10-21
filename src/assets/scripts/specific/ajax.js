contentLoaded(window, function() {

  var request = new XMLHttpRequest();
  request.open('GET', 'http://date.jsontest.com/', true);

  request.onload = function() {
    if (request.status >= 200 && request.status < 400) {
      var data = JSON.parse(request.responseText);
      loadTime(data);
    } else {
    }
  };

  request.onerror = function() {
  };

  request.send();
});

function loadTime(data) {

  var template = document.querySelector('#dateTemplate').innerHTML,
      targetDiv = document.querySelector('#dateTarget');

  Mustache.parse(template);

  var rendered = Mustache.render(template, {time: data.time, date: data.date});
  
  targetDiv.innerHTML = rendered;
}