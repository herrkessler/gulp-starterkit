$(document).ready(function(){
  $.ajax({
    url: "http://date.jsontest.com/"
  }).done(function(data) {
    loadTime(data);
  });
});

function loadTime(data) {
  var template = $('#dateTemplate').html();
  Mustache.parse(template);
  var rendered = Mustache.render(template, {time: data.time, date: data.date});
  $('#dateTarget').html(rendered);
}