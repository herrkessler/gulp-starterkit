[].slice.apply(document.querySelectorAll('img[data-src]')).forEach(function(img) {
  img.setAttribute('src', img.getAttribute('data-src'));
  img.onload = function() {
    img.removeAttribute('data-src');
    img.classList.remove('lazy');
  };
});