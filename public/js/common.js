function ajax({
  url,
  type,
  contentType,
  data,
  success,
  fail
}) {
  $.ajax({
    url,
    type,
    contentType: contentType || 'text/json;charset=UTF-8',
    data
  }).then(success, fail)
}

window.common = {
  ajax
}
