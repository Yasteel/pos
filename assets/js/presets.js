function showAlert(text, type, stay)
{
  $('div.alert_message p.message').html(text);
  if(type === 1)
  {
    $('div.alert_message').addClass('success');
    $('.message_type_icon').removeClass('fa-times');
    $('.message_type_icon').addClass('fa-check');
  }
  else if(type === 2)
  {
    $('div.alert_message').addClass('fail');
    $('.message_type_icon').addClass('fa-times');
    $('.message_type_icon').removeClass('fa-check');
  }
  $('div.alert_message').addClass('show');

  if(!stay)
  {
    setTimeout(function()
  {
    $('div.alert_message').removeClass('show');
    $('div.alert_message').removeClass('success');
    $('div.alert_message').removeClass('fail');
  }, 3200);
  }
}
