$(document).ready(function()
{
  fetch_branches();
});


$(document).on('click', '.btn_login', function()
{
  login();
});

$(document).on('keypress', 'input, select', function(e)
{
  if(e.key == 'Enter')
  {
    $('.btn_login').click();
  }
});


function fetch_branches()
{
  console.log('awe');
  $.post('assets/php/index.php',
  {
    'operation': 'fetch_branches'
  },
  function(response)
  {
    if(response == 0)
    {
      showAlert('No Branches Found', 2);
    }
    else
    {
      let branches = JSON.parse(response);
      $('select#branches').html('<option value="0">Select Branch</option');
      branches.forEach(branch =>
        {
          $('select#branches').append(
            `
            <option value="${branch.branch_no}">${branch.description}</option>
            `);
        });
    }
  });
}

function login()
{
  let branch_no = parseInt($('select').val());
  let username = $('#username').val();
  let pass = $('#pass').val();

  if(branch_no == 0)
  {
    showAlert('Please Select a Branch', 2);
    $('select').addClass('err');
    setTimeout(function()
    {
      $('select').removeClass('err');
    },3000);
  }
  else
  {
    if(username.trim() == '')
    {
      showAlert('Enter a Username', 2);
      $('#username').addClass('err');
      setTimeout(function()
      {
        $('#username').removeClass('err');
      },3000);
    }
    else
    {
      if(pass.trim() == '')
      {
        showAlert('Enter a Password', 2);
        $('#pass').addClass('err');
        setTimeout(function()
        {
          $('#pass').removeClass('err');
        },3000);
      }
      else
      {
        $.post('assets/php/index.php',
        {
          'operation': 'login',
          'branch': branch_no,
          'username': username,
          'pass': pass
        },
        function(response)
        {
          console.log(response);
          if(response == 0)
          {
            showAlert('User Not Found / Credentials Incorrect', 2);
          }
          else
          {
            showAlert('Login Success', 1, true);
            setTimeout(function()
            {
              let user_data = JSON.stringify({'bno': branch_no, 'username': username, 'access_level': response});

              sessionStorage.setItem('user_data', user_data);
              window.location.href = "home.html";
            },2000);
          }
        });
      }
    }
  }
}
