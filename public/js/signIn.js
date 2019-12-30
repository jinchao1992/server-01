const $form = $('#signInForm')
$form.on('submit', (e) => {
  e.preventDefault()
  const name = $form.find('input[name="name"]').val()
  const password = $form.find('input[name="password"]').val()
  common.ajax({
    url: '/signIn',
    type: 'post',
    data: JSON.stringify({
      name,
      password
    }),
    success() {
      alert('success')
      window.location.href = './home.html'
    },
    fail() {
      console.log('失败')
    }
  })
})